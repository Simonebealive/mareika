/* eslint-disable no-undef */
import express from "express";
import admin from "firebase-admin";
import bcrypt from "bcrypt";
import path from "path";
import { isFormValid } from "./public/js/utils.js";
import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

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

// aws config
import aws from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

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

// routes
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.post("/reservations", async (req, res) => {
  const { productId, userId } = req.body;
  const expiresAt = admin.firestore.Timestamp.fromDate(
    // 10 minutes
    new Date(Date.now() + 10 * 60 * 1000)
  );
  try {
    const existingReservation = await db
      .collection("reservations")
      .doc(productId)
      .get();
    if (existingReservation.exists) {
      return res.status(400).json({ message: "Reservation already exists" });
    }
    await db.collection("reservations").doc(productId).set({
      productId,
      userId,
      expiresAt,
    });
    res.status(200).json({
      message: "Reservation created successfully",
      id: productId,
    });
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
  expiredReservations.forEach((reservation) => {
    batch.delete(reservation.ref);
  });
  await batch.commit();
  console.log(`${expiredReservations.size} expired reservations cleaned up`);
}

// clean up expired reservations every 5 minutes
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
  let { about, number, tac, legitInfo, email } = req.body;
  if (!about.length || number.length < 10 || !Number(number)) {
    return res.json({ alert: "Some informations are invalid" });
  } else if (!tac || !legitInfo) {
    return res.json({ alert: "Boxes must be checked!" });
  } else {
    // store seller in db
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
  const { id, reserved, sold } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Product ID required for update" });
  }

  const updateData = {};
  if (reserved !== undefined) updateData.reserved = reserved;
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
  if (name.length < 3) {
    return res.json({ alert: "name must be at least two letters long" });
  } else if (!email.length) {
    return res.json({ alert: "Enter a email address" });
  } else if (password.length < 8) {
    return res.json({
      alert: "Password has to be at least 8 characters long!",
    });
  } else if (!number.length) {
    return res.json({ alert: "Enter a phone number" });
  } else if (!Number(number) || number.length < 10) {
    return res.json({ alert: "Number invalid!" });
  } else if (!tac) {
    return res.json({ alert: "Agree to the the terms and conditions" });
  }
  // store user in db
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
                  name: req.body.name,
                  email: req.body.email,
                  seller: req.body.seller,
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
  if (!email.length || !password.length) {
    return res.json({ alert: "please fill out the form" });
  }
  db.collection("users")
    .doc(email)
    .get()
    .then((user) => {
      if (!user.exists) {
        return res.json({ alert: "email does not exist" });
      } else {
        bcrypt.compare(password, user.data().password, (err, result) => {
          if (result) {
            let data = user.data();
            return res.json({
              name: data.name,
              email: data.email,
              seller: data.seller,
            });
          } else {
            return res.json({ alert: "password is incorrect" });
          }
        });
      }
    });
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
