const express = require('express')
const admin = require('firebase-admin')
const bcrypt = require('bcrypt')
const path = require('path')
const { stat } = require('fs')

// firebase admin setup
let serviceAccount = require("./.env/mareika-ecom-firebase-adminsdk-dvj8h-84846c749c.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

let db = admin.firestore()

// init express
let staticPath = path.join(__dirname, "public")
const app = express()
// middlewares
app.use(express.static(staticPath))
app.use(express.json())

// routes
app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"))
})

app.get("/seller", (req, res) => {
    res.sendFile(path.join(staticPath, "seller.html"))
})

app.post("/seller", (req, res) => {
    let { name, address, about, number, tac, legitInfo, email } = req.body
    if (!about.length ||
        number.length < 10 ||
        !Number(number)) {
        return res.json({ 'alert': 'Some informations are invalid' })
    } else if (!tac || !legitInfo) {
        return res.json({ 'alert': 'Boxes must be checked!' })
    } else {
        // store seller in db
        db.collection('sellers').doc(email).set(req.body)
            .then(data => {
                db.collection('users').doc(email).update({
                    seller: true
                }).then(data => {
                    res.json(true)
                })
            })
    }
})

app.get("/signup", (req, res) => {
    res.sendFile(path.join(staticPath, "signup.html"))
})

app.post("/signup", (req, res) => {
    let { name, email, password, number, tac } = req.body
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
                        req.body.password = hash
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
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(staticPath, "login.html"))
})

app.post("/login", (req, res) => {
    let { email, password } = req.body
    if (!email.length || !password.length) {
        return res.json({ 'alert': 'please fill out the form' })
    }
    db.collection('users').doc(email).get()
        .then(user => {
            if (!user.exists) {
                return res.json({ 'alert': 'email does not exist' })
            } else {
                bcrypt.compare(password, user.data().password, (err, result) => {
                    if (result) {
                        let data = user.data()
                        return res.json({
                            name: data.name,
                            email: data.email,
                            seller: data.seller,
                        })
                    } else {
                        return res.json({ 'alert': 'password is incorrect' })
                    }
                })
            }
        })
})

app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath, "404.html"))
})

app.use((req, res) => {
    res.sendFile(path.join(staticPath, "404.html"))
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})