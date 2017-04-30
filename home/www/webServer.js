'use strict';

/*
 * A simple Node.js program for exporting the current working directory via a webserver listing
 * on a hard code (see portno below) port. To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:3001 will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 */

// For parsing request body parameters
var bodyParser = require('body-parser');

// Hosting Mongoose/mongodb on our local server
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Jam');
var Song = require('./schema/Songs');

// Open mongodb connection (make sure Mongo is running!)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// Used for uploading photo functionality
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

// Schema for Well Entries (Mongoose)
var Entry = require('./schema/entry.js');

// HTTP
var http = require('http');
var portno = 3000;   // Port number to use
var fs = require('fs');

// Express - client for easy communication between backend and frontend
var express = require('express');
var app = express();

app.use(bodyParser.json());

// Sets working directory (directory loaded) to __dirname, which is "Jam/home/www"
// Not sure where I set __dirname though...
app.use(express.static(__dirname));


// Server startup
var server = app.listen(portno, function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

// API ROUTES BELOW

// Generic error handler
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/* "/songs"
 * GET: finds all songs (in this room)
 * POST: adds a new song (to this room)
 */
app.get("/songs", function(req, res) {
  Song.find(function(err, songs) {
    if(err) {
      handleError(res, err.message, "Failed to retrieve song list.");
    } else {
      res.status(200).json(songs);
    }
  });
});

app.post("/songs", function(req, res) {
  var song = new Song(req.body);
  song.save(function(err, song){
    if(err){
      handleError(res, err.message, "Failed to add song to list.");
    } else {
      res.json(song);
    }
  });
});

/* "/upvote"
 * POST: upvote the song whose spotifyId is given in the body as sid.
 */
app.post("/upvote", function(req, res) {
  Song.findOne({ 'spotifyId': req.body.sid }, function(err, song) {
    if(err) {
      handleError(res, err.message, "Failed to retrieve song to upvote.");

    } else {
      song.upvote(function(err, song) {

        if(err) {
          handleError(res, err.message, "Failed to upvote song.");
        } else {
          res.json(song);
        }
      });
    }
  });
});
