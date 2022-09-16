// import required modules
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const path = require('path');
var multer = require('multer');
var cookieParser = require("cookie-parser");
var upload = multer();
var xss = require('xss');

// load local config variables
require("dotenv").config();

// user defined modules
var auth = require('./backend/auth.js');
var rep = require('./backend/repertoire.js');
const { title } = require('process');

// express app instance
var app = express();

// temporary database url
var dbURL = process.env.DATABASE_URL;

// maximum cookie length of one hour
var oneHour = 1000 * 60 * 60;

// initializes app settings, such
// as defining the public folder
// and initializing session managers
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(session({
    secret: 'abcdefg',
    saveUninitialized: true,
    cookie: {maxAge: oneHour},
    resave: false
}));
app.use(cookieParser());

// set view engine and views
app.set('views', path.join(__dirname, 'templates'))
app.set('view engine', 'ejs')

// route for main page
app.get("/", function(req, res) {
    res.render("index");
});

// route for login page
app.get("/login", function(req, res) {
    res.render("login");
});

// authenticate user
app.post("/authenticate", function(req, res) {
    try {
        auth.validateUser(xss(req.body['username']), xss(req.body['password']), dbURL, req, res);
    } catch (err) {
        res.redirect("/login");
    }
});

// route for registration page
app.get("/registration", function (req, res) {
    res.render("registration");
});

// route for registering a user
app.post("/register", function (req, res) {
    try {
        auth.register(req.body['username'], xss(req.body['password']), dbURL, res);
    } catch (err) {
        res.redirect("/login");
    }
});

// route for search page
app.get("/search", auth.isLoggedIn, function(req, res) {
    res.render("search");
});

// route for finding songs based on query
app.post("/find", auth.isLoggedIn, function(req, res) {
    // makes query string object from the form
    var query = {
        "title": xss(req.body['title']),
        "is_ks": xss(req.body['is_ks'])
    };

    // if the form was submitted as "empty", then
    // treat finding songs as an empty query (pass
    // an empty query to MongoDB)
    var titleEmpty = (query['title'] == "" || query['title'] == null);
    var isKsEmpty = (query['is_ks'] == "" || query['is_ks'] == null);

    rep.findSongs(query, dbURL, res, titleEmpty, isKsEmpty);    
});

// route for logging out
app.get("/logout", auth.isLoggedIn, function(req, res) {
    //"un-sets" sessions
    req.session.userid = null;
    res.redirect("/");
});

// local development server on port 3000
var server = app.listen(3000, function() {
    // message including development server link
    console.log("Server listening at http://localhost:3000");
});
