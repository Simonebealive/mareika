const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');
const { stat } = require('fs');

// firebase admin setup
let serviceAccount = require("./.env/mareika-ecom-firebase-adminsdk-dvj8h-84846c749c.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore()

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

app.get("/signup", (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"));
});

app.post("/signup", (req, res) => {
    let { name, email, password, number, tac } = req.body;
    if (name.length < 3) {
        return res.json({ 'alert': 'name must be at least two letters long' })
    } else if (!email.length) {
        return res.json({ 'alert': "Enter a email address" })
    } else if (password.length < 8) {
        return res.json({ 'alert': "Password has to be at least 8 characters long!" })
    } else if (!number.length) {
        return res.json({ 'alert': "Enter a phone number" })
    } else if (!Number(number) || number.length < 10) {
        return res.json({ 'alert': "Number invalid!" })
    } else if (!tac) {
        return res.json({ 'alert': "Agree to the the terms and conditions" })
    }
    // store user in db
    db.collection('users').doc(email).get()
        .then(user => {
            if (user.exists) {
                return res.json({ 'alert': 'email already exists' })
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        req.body.password = hash;
                        db.collection('users').doc(email).set(req.body)
                            .then(data => {
                                res.json({
                                    name: req.body.name,
                                    email: req.body.email,
                                    seller: req.body.seller,
                                })
                            })
                    })
                })
            }
        })
});

app.use((req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});