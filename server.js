import jwt from "jsonwebtoken";
import express from "express";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import path from "path";
import { isSignUpValid } from "./public/js/utils.js";
import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import aws from "aws-sdk";
import cookieParser from "cookie-parser";

dotenv.config();

// middleware for authentication
const JWT_SECRET = process.env.JWT_SECRET || null;

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set.");
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// firebase admin setup
const serviceAccountPath = path.join(
  __dirname,
  ".cred",
  "mareika-ecom-firebase-adminsdk-dvj8h-84846c749c.json"
);
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();

// aws parameters
const region = "eu-north-1";
const bucketName = "mareika-ecom";
const accessKeyId = process.env.AWS_ACCESS_KEY || null;
const secretAccessKey = process.env.AWS_SECRET_KEY || null;
aws.config.update({
  region,
  accessKeyId,
  secretAccessKey,
});
// init s3
const s3 = new aws.S3();
// generate image upload link
async function generateUrl() {
  let date = new Date();
  let id = parseInt(Math.random() * 10000000000);
  const imageName = `${id}${date.getTime()}.jpg`;
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 300,
    ContentType: "image/jpeg",
  };
  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
}

// init express
let staticPath = path.join(__dirname, "public");
const app = express();
// middlewares
app.use(express.static(staticPath));
app.use(express.json());
app.use(cookieParser());

// routes
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.post("/reservations", async (req, res) => {
  const { productId } = req.body;
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    await db.runTransaction(async (transaction) => {
      const reservationRef = db.collection("reservations").doc(productId);

      const reservationDoc = await transaction.get(reservationRef);

      if (reservationDoc.exists) {
        throw new Error("Product already reserved");
      }

      transaction.set(reservationRef, {
        productId,
        userEmail,
        expiresAt,
      });
    });

    res.status(200).json({
      message: "Reservation created successfully",
      id: productId,
    });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(400).json({ message: error.message });
  }
});

app.get("/reservations", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;
    const reservations = await db
      .collection("reservations")
      .where("userEmail", "==", userEmail)
      .get();
    const reservationList = reservations.docs.map((doc) => doc.data());
    res.status(200).json(reservationList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/reservations/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const reservation = await db.collection("reservations").doc(id).get();
    if (!reservation.exists) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.status(200).json(reservation.data());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function cleanUpExpiredReservations() {
  const now = admin.firestore.Timestamp.now();
  const expiredReservations = await db
    .collection("reservations")
    .where("expiresAt", "<=", now)
    .get();
  const batch = db.batch();
  for (const reservation of expiredReservations.docs) {
    batch.delete(reservation.ref);
  }
  await batch.commit();
  console.log(`${expiredReservations.size} expired reservations cleaned up`);
}

setInterval(cleanUpExpiredReservations, 5 * 60 * 1000);

app.get("/about_me", (req, res) => {
  res.sendFile(path.join(staticPath, "about_me.html"));
});

app.get("/:theme(landscape|portrait|abstract)", (req, res) => {
  const theme = req.params.theme;
  fs.readFile(path.join(staticPath, "theme.html"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("An error occurred while loading the page.");
    }
    const modifiedHtml = data.replace("{{tag}}", theme);
    res.send(modifiedHtml);
  });
});

app.post("/get-products", (req, res) => {
  let { id, tag, email } = req.body;
  let docRef;
  if (id) {
    docRef = db.collection("products").doc(id);
  } else if (tag) {
    docRef = db
      .collection("products")
      .where("categories", "array-contains", tag);
  } else if (email) {
    docRef = db.collection("products").where("email", "==", email);
  } else {
    throw new Error("Invalid request for /get-products");
  }
  docRef.get().then((products) => {
    if (products.empty) {
      return res.json([]);
    }
    if (id) {
      return res.json(products.data());
    } else {
      let productArr = [];
      products.forEach((item) => {
        let data = item.data();
        data.id = item.id;
        productArr.push(data);
      });
      res.json(productArr);
    }
  });
});

app.post("/delete_product", (req, res) => {
  let { id } = req.body;
  db.collection("products")
    .doc(id)
    .delete()
    .then(() => {
      res.json("success");
    })
    .catch(() => {
      res.json("error");
    });
});

app.get("/seller", (req, res) => {
  res.sendFile(path.join(staticPath, "seller.html"));
});

app.post("/seller", (req, res) => {
  let { email } = req.body;
  if (!email.length) {
    return res.json({ alert: "Email is required" });
  } else {
    db.collection("sellers")
      .doc(email)
      .set(req.body)
      .then(() => {
        db.collection("users")
          .doc(email)
          .update({
            seller: true,
          })
          .then(() => {
            res.json({ seller: true });
          });
      });
  }
});

app.get("/add_product", (req, res) => {
  res.sendFile(path.join(staticPath, "add_product.html"));
});

app.post("/add_product", (req, res) => {
  let { draft, productName, id } = req.body;
  let validationResult = isFormValid(req.body);
  if (!draft) {
    if (!validationResult) {
      return res.json(validationResult);
    }
  }
  let date = new Date();
  let docName =
    id == undefined
      ? `${productName.toLowerCase().split(" ").join("-")}-${date.getTime()}`
      : id;
  req.body.id = docName;
  db.collection("products")
    .doc(docName)
    .set(req.body)
    .then(() => {
      res.json({ product: productName });
    })
    .catch(() => {
      res.json({ alert: "An error occured" });
    });
});

app.post("/update_product", (req, res) => {
  const { id, sold } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Product ID required for update" });
  }

  const updateData = {};
  if (sold !== undefined) updateData.sold = sold;

  db.collection("products")
    .doc(String(id))
    .update(updateData)
    .then(() => {
      res.json({ message: "Success" });
    })
    .catch((error) => {
      console.error("Error updating product: ", error);
      res.status(500).json({ message: "Error updating product" });
    });
});

app.get("/add_product/:id", (req, res) => {
  res.sendFile(path.join(staticPath, "add_product.html"));
});

app.get("/s3url", (req, res) => {
  generateUrl().then((url) => res.json(url));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(staticPath, "signup.html"));
});

app.post("/signup", (req, res) => {
  let { name, email, password, number, tac } = req.body;
  let validationResult = isSignUpValid({ name, email, password, number, tac });
  if (!validationResult.valid) {
    return res.json({ alert: validationResult.alert });
  }
  db.collection("users")
    .doc(email)
    .get()
    .then((user) => {
      if (user.exists) {
        return res.json({ alert: "email already exists" });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            req.body.password = hash;
            db.collection("users")
              .doc(email)
              .set(req.body)
              .then(() => {
                res.json({
                  message: "success",
                });
              });
          });
        });
      }
    });
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(staticPath, "login.html"));
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ alert: "Please fill out the form" });
  }
  db.collection("users")
    .doc(email)
    .get()
    .then((user) => {
      if (!user.exists) {
        return res.status(404).json({ alert: "Email does not exist" });
      } else {
        bcrypt.compare(password, user.data().password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return res
              .status(500)
              .json({ alert: "An error occurred during login" });
          }
          if (result) {
            let data = user.data();
            try {
              const token = jwt.sign(
                {
                  email: data.email,
                  seller: data.seller,
                },
                JWT_SECRET,
                { expiresIn: "1h" }
              );
              res.cookie("token", token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production", // Use secure cookies in production
                sameSite: "lax",
                maxAge: 3600000, // 1 hour in milliseconds
              });
              console.log(
                "Token set in cookies:",
                res.getHeaders()["set-cookie"]
              );
              return res.json({
                message: "Login successful",
                email: data.email,
                seller: data.seller,
              });
            } catch (jwtError) {
              console.error("Error creating JWT:", jwtError);
              return res
                .status(500)
                .json({ alert: "An error occurred during login" });
            }
          } else {
            return res.status(401).json({ alert: "Password is incorrect" });
          }
        });
      }
    })
    .catch((dbError) => {
      console.error("Database error:", dbError);
      res
        .status(500)
        .json({ alert: "An error occurred while accessing the database" });
    });
});

app.post("/logout", async (req, res) => {
  console.log("Logout request received");
  console.log("Cookies before clearing:", req.cookies);

  res.clearCookie("token");

  console.log("Cookies after clearing:", req.cookies);
  console.log("Response headers:", res.getHeaders());

  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/verify-token", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ valid: false, alert: "No token provided" });
  }
  try {
    console.log("Verifying token:", token);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    // console log all attributes from decoded
    console.log("Decoded token attributes:", Object.keys(decoded));
    return res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    console.log("Invalid token:", err);
    return res.status(401).json({ valid: false, alert: "Invalid token" });
  }
});

app.get("/products/:id", (req, res) => {
  res.sendFile(path.join(staticPath, "product.html"));
});

app.get("/search/:key", (req, res) => {
  res.sendFile(path.join(staticPath, "search.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(staticPath, "cart.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(staticPath, "checkout.html"));
});

app.post("/order", (req, res) => {
  let { order, email, address } = req.body;
  if (!order.length) {
    return res.json({ alert: "Cart is empty" });
  }
  if (!address) {
    return res.json({ alert: "Address is empty" });
  }
  if (!email) {
    return res.json({ alert: "Email is empty" });
  }

  let date = new Date();
  let docName = `${email}-${date.getTime()}`;
  const statusURL = `http://localhost:3000/order/${docName}`;

  let transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cda9f88697ea43",
      pass: "0efb6c7dd4eb46",
    },
  });

  const emailTemplate = fs
    .readFileSync(path.join(staticPath, "mail.html"), "utf8")
    .replace("{{statusURL}}", statusURL);

  const mailOption = {
    from: "skorpijon93@gmail.com",
    to: email,
    subject: "Mareika: Order Confirmation",
    html: emailTemplate,
  };

  db.collection("orders")
    .doc(docName)
    .set({ order, address })
    .then((data) => {
      transporter.sendMail(mailOption, function (err, info) {
        if (err) {
          console.error(err);
          return res.json({ alert: "error" });
        } else {
          return res.json({ alert: "success" });
        }
      });
    });
});

app.post("/order/:id", (req, res) => {
  let { id } = req.params;
  db.collection("orders")
    .doc(id)
    .get()
    .then((order) => {
      if (!order.exists) {
        return res.json({ alert: "Order not found" });
      }
      return res.json(order.data());
    })
    .catch(() => {
      return res.json({ alert: "Error occured" });
    });
});

app.get("/order/:id", (req, res) => {
  res.sendFile(path.join(staticPath, "order.html"));
});

app.get("/404", (req, res) => {
  res.sendFile(path.join(staticPath, "404.html"));
});

app.use((req, res) => {
  res.sendFile(path.join(staticPath, "404.html"));
});

app.get("/debug-token", (req, res) => {
  console.log("Cookies received:", req.cookies);
  res.json({ cookies: req.cookies });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
