const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');
const { stat } = require('fs');

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
    console.log(req.body);
    res.json('data received');
});

app.use((req, res) => {
    res.sendFile(path.join(staticPath, "404.html"));
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});