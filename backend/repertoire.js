var client = require('mongodb').MongoClient;


function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


function findSongs(query, dbURL, response, titleEmpty, isKsEmpty) {
    // connect client to database
    client.connect(dbURL, function (err, db) {
        // error handling
        if (err) {
            response.render("search");
            return;
        }

        // database object
        var dbo = db.db("kindredspirit");

        var queryObj = {};

        if (!titleEmpty) {
            queryObj["title"] = {"$regex": "^" + escapeRegExp(query['title']), "$options": "i"};
        }

        if (!isKsEmpty) {
            queryObj["title"] = {"$regex": "^" + escapeRegExp(query['is_ks']), "$options": "i"};
        }

        // gets all songs from the database
        // that match the query
        dbo.collection("songs").find(queryObj).limit(0).sort({"title": 1}).toArray(function (err, docs) {
            if (err) {
                response.render("search");
                return;
            }

            db.close();

            // render results in a new page
            response.render("results", {"items": docs, "count": docs.length});
            return;
        });
    });
}


function addSong(dbURL) {

}


function deleteSong(id, dbURL) {

}


module.exports.findSongs = findSongs;