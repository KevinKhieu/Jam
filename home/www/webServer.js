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

app.use(bodyParser.json());

// Server Setup //

var http = require('http').Server(app);
var io = require('socket.io')(http);
// Load data from data.json (local datastore - used for safety reasons in case MongoDB decides to crash)
var data = require('./data.json');

// Schema for Well Entries (Mongoose)
var Entry = require('./schema/entry.js');

routes.initSocketConnection(io);

var portno = 3000;  // Port number to use
http.listen(portno, function() {
	console.log('Listening at http://localhost:' + portno + ' exporting the directory ' + __dirname);
});

app.get('/firstData/', function(request, response) {
	Entry.count({}, function(err, count) {
		if (!err) {

			// Console messages for checking if MongoDB and Data.json match. We just use counts of entries to check.
			console.log(count);	// mongo
			console.log(data.length);	// data.json
			response.status(200).send([count, data.length]);

		} else {
			response.status(400).send("Error");
		}
	});
})

/* GET: /clearMongo/
 * Returns objects in data.json in json object format.
 * 
 * Called only if mongoDB doesnt match data.json.
 * CLEARS Mongo Database. Expects user to rewrite entire database after.
 */
app.get('/clearMongo/', function (request, response) {

	// Get all entries in mongo and erase them.
	Entry.find({}, function(err, entries) {
		var entryMap = {};
		entries.forEach(function(entry) {
			entryMap[entry._id] = entry;
			Entry.remove({_id: entry._id}, function(err) {
				if (!err) {
					console.log("SUCCESS Removal of " + entry._id);
				} else {
					console.log("FAILURE Removal of " + entry._id);
				}
			})
			
		});
		response.status(200).send(JSON.stringify(data));
	})
});

/* GET: /newData/
 * Returns objects in data.json in json object format WITHOUT clearing MongoDB database.
 */
app.get('/newData/', function(request, response) {
	response.status(200).send(JSON.stringify(data));
})

app.get('/songList/', function(request, response) {
	var entryMap = [];
	Entry.find({}, function(err, entries) {
		entries.forEach(function(entry) {
			entryMap.push(entry);
			console.log(entry);
		});
		console.log(entryMap);
		response.status(200).send(JSON.stringify(entryMap));
	})
})


/*
 * POST /entry - create new Entry (INITIALIZE FROM data.json)
 */
app.post('/entry', function(request, response) {

	// songName: data[i].songName,
	//                 	artist: data[i].artist,
	//                 	link: data[i].link,
	//                 	upvotes: data[i].numVotes,
	//                 	songId: data[i].songId,
	//                 	userAdded: "Kevin"
	// Get body parameters
	var currArtist = request.body.artist;
	var currLink = request.body.link;
	var currUpvotes = request.body.upvotes;
	var currSongId = request.body.songId;
	var currUserAdded = request.body.userAdded;
	var currSongName = request.body.songName;
	
	// If we have valid paramters, create new Well Entry
	if (currSongName != null && currArtist != null && currLink != null) {

		// Mongoose: Create Entry
		Entry.create({
        	songName: currSongName,
        	artist: currArtist,
        	upvotes: currUpvotes,
        	songId: currSongId,
        	userAdded: currUserAdded,
        	link: currLink
    	}, function (err, userObj) {
        	if (err) {
            	console.error('Error create', err);
        	} else {
            	// Set the unique ID of the object.
            	userObj.id = userObj._id;
            	userObj.save();
        	}
    	});
    	
    // Error Handling 
	}
	response.end("Complete Registration");
});


// Sets working directory (directory loaded) to __dirname, which is "Jam/home/www"
// Not sure where I set __dirname though...
app.use(express.static(__dirname));
var fs = require('fs');

app.use(bodyParser.json());
