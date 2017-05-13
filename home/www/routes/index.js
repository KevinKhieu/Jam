'use strict';

var Song = require('../schema/Songs');

// Generic error handler
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

exports.list = function(req, res) {
	Song.find(function(err, songs) {
		if(err) {
			handleError(res, err.message, "Failed to retrieve song list.");
		} else {
			res.status(200).json(songs);
		}
	});
};

exports.add = function(req, res) {
	var song = new Song(req.body);
	song.save(function(err, song){
		if(err){
			handleError(res, err.message, "Failed to add song to list.");
		} else {
			res.json(song);
		}
	});
};

exports.upvote = function(req, res) {
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
};

exports.reset = function(req, res) {
	Song.remove({}, function(err) {
		if (err) {
			handleError(res, err.message, "Failed to remove all songs from database.");
		} else {
			res.send('successfully removed all songs from database.');
		}
	});
};

function getIP(socket) {
	console.log('forwarded-for: ' + socket.handshake.headers['x-forwarded-for']);
		//TODO: The above may be obsolete and nonfunctional.
	console.log('socket.request.connection.remoteAddress: ' + socket.request.connection.remoteAddress);
	return socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
}

exports.initSocketConnection = function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});

	// ADDING SONG //
	socket.on('send:add-song', function(data) {
		var song = new Song(data);
		song.save(function(err, song){
			if(err){
				handleError(res, err.message, "Failed to add song to list.");
			} else {
				console.log("Broadcasting push:add-song...");
				socket.emit('push:add-song', song);
				socket.broadcast.emit('push:add-song', song);
			}
		});
	});

	// UPVOTING //
	socket.on('send:upvote', function(data) {
		var sid = data.sid;
		var ip = getIP(socket);
		console.log('user at ip ' + ip + ' upvoted ' + sid);

		Song.findOne({'spotifyId': sid}, function(err, song) { //TODO: make sure calling findOne correctly
			if(err) {
				handleError(res, err.message, "Failed to find song with given sid to upvote.");
			} else {

				song.upvote(ip, function(err, doc) {
					if(err) {
						handleError(res, err.message, "Failed to save song after upvoting it.");

					} else {
						console.log("Broadcasting push:upvote...");
						socket.emit('push:upvote', doc);
						socket.broadcast.emit('push:upvote', doc);
						// io.emit('push:upvote', doc);
					}
				});
			}
		});

	});
};
