const users = [];
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
// getting-started.js
// const mongoose = require('mongoose');
// const dbname = "todolistDB";
// const uri = `mongodb+srv://jhadeepesh3:nVb2hIdBBVuMd5Li@deepesh.jzjdlwj.mongodb.net/${dbname}?retryWrites=true&w=majority`;

// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(uri);
//   const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error: "));
// db.once("open", () => {
//   console.log("Connected successfully");
// });
// }

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.get("/users/:username", (req, res) => {
    users.forEach(user => {
        if (_.lowerCase(user.username) === _.lowerCase(req.params.username))
            res.render("profile", {user: user});
    });
});

app.post("/signup", (req, res) => {
    const user = {
        username: req.body.username,
        email: req.body.userEmail,
        password: req.body.userPassword
    };
    users.push(user);
    res.redirect("/users/" + user.username);
    // res.redirect("/");
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});