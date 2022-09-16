// MongoDB client and password hashing modules
var client = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');


/**
 * Registers a user if they provide the correct
 * registration code.
 * @param {String} user 
 * @param {String} password 
 * @param {String} dbURL 
 * @param {Response} response 
 */
function register(user, password, dbURL, response) {
    // creates a connection to the database url
    client.connect(dbURL, function(err, db) {
        // calls the error callback function
        if (err) {
            response.redirect("/registration");
            return;
        }

        // finds the "ks" database
        var dbo = db.db("kindredspirit");

        // creates a user object
        var userObj = {"username": user};

        // password object looking for registration code
        var passObj = {"type": "register"};
        bcrypt.compare(password, process.env.REGISTER_CODE, function (err, res) {
            if (err) {
                response.redirect("/registration");
                return;
            }

            if (res == false) {
                response.redirect("/registration");
                return; 
            }

            // adds the user object to the list
            dbo.collection("users").insertOne(userObj, function (err, res) {
                if (err) {
                    response.redirect("/registration");
                    return;
                }

                // closes database connection
                db.close();

                // redirects user to login page
                response.redirect("/login");

                // returns
                return;
            });
        });
    });
}


/**
 * Validates a user to see if they exist and
 * they provided the correct access code.
 * @param {String} user 
 * @param {String} password 
 * @param {String} dbURL 
 * @param {Request} request 
 * @param {Response} response 
 */
function validateUser(user, password, dbURL, request, response) {
    // creates a connection to the database url
    client.connect(dbURL, function(err, db) {
        // calls the error callback function
        if (err) {
            response.redirect("/login");
            return;
        }

        // finds the "ks" database
        var dbo = db.db("kindredspirit");

        // compares the passwords to make sure the password
        // is valid
        bcrypt.compare(password, process.env.ACCESS_CODE, function (err, res) {
            if (err) {
                response.redirect("/login");
                return;
            }
            
            if (res == false) {
                response.redirect("/login");
                return;
            }

            // creates a user query
            var userObj = {"username": user};

            // finds the user object from the databaase
            dbo.collection("users").findOne(userObj, function (err, res) {
                // calls the error callback function
                if (err) {
                    response.redirect("/login");
                    return;
                }

                if (!res)  {
                    response.redirect("/login");
                    return;
                }

                // closes database connection
                db.close();

                // sets sessions
                request.session.userid = res.username;

                // redirects to search if all is successful
                response.redirect("/search");
                
                return;
            });
        });
    });
}


/**
 * Makes sure a user is correctly logged
 * in to access a protected feature.
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 * @returns 
 */
function isLoggedIn(req, res, next) {
    if (req.session.userid) {
        return next();
    }

    res.redirect("/login");
}

module.exports.register = register;
module.exports.validateUser = validateUser;
module.exports.isLoggedIn = isLoggedIn;
