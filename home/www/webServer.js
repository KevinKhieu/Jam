'use strict';

/*
 * Express/Node.js entry point for Jam application.
 * To start the application:
 * 1. sudo service mongod start
 * 2. node webServer.js
 *
 * Application currently runs at localhost:3000.
 *
 * Note that anyone able to connect to localhost:3000 will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 * TODO: fix this.
 */

// For parsing request body parameters
var bodyParser = require('body-parser');

// Hosting Mongoose/mongodb on our local server
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Jam');
var routes = require('./routes/index');

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

// Express - client for easy communication between backend and frontend
var express = require('express');
var app = express();

// Server Setup //

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.sockets.on('connection', routes.initSocketConnection);

var portno = 3000;  // Port number to use
http.listen(portno, function() {
	console.log('Listening at http://localhost:' + portno + ' exporting the directory ' + __dirname);
});

// Sets working directory (directory loaded) to __dirname, which is "Jam/home/www"
// Not sure where I set __dirname though...
app.use(express.static(__dirname));
var fs = require('fs');

app.use(bodyParser.json());

// API routes

/* "/reset"
 * for debugging
 * POST: empties the database
 */
 app.get("/reset", routes.reset);
