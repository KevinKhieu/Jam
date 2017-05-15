'use strict';

var Song = require('../schema/Songs');

// Generic error handler
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

function pushQueue(transport) {
	/* Gets the entire song queue from the database and emits it via the given
	 * transport as a push:queue. The transport should either be a socket, or the
	 * io object itself. A socket to send to that socket; io to send to all sockets. */
	Song.find(function(err, songs) {
		if(err) {
			handleError(res, err.message, "Failed to retrieve song list.");
		} else {
			transport.emit('push:queue', songs);
		}
	});
}

function getNowPlaying() {}

function getLastPlayed() {}

function getIP(socket) {
	console.log('forwarded-for: ' + socket.handshake.headers['x-forwarded-for']);
		//TODO: The above may be obsolete and nonfunctional.
	console.log('socket.request.connection.remoteAddress: ' + socket.request.connection.remoteAddress);
	return socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
}

exports.initSocketConnection = function(io) {
io.sockets.on('connection', function(socket) {
	console.log('a user connected - sending room data');

	// socket.emit('push:now-playing', getNowPlaying());
	pushQueue(socket);
	// socket.emit('push:last-played', getLastPlayed());

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
				// socket.emit('push:add-song', song);
				// socket.broadcast.emit('push:add-song', song);
				io.emit('push:add-song', song);
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
						// socket.emit('push:upvote', doc);
						// socket.broadcast.emit('push:upvote', doc);
						io.emit('push:upvote', doc);  //TODO: abstract this out like pushQueue()
					}
				});
			}
		});
	});

	// DOWNVOTING //
	socket.on('send:downvote', function(data) {
		var sid = data.sid;
		var ip = getIP(socket);
		console.log('user at ip ' + ip + ' downvoted ' + sid);

		Song.findOne({'spotifyId': sid}, function(err, song) {
			if(err) {
				handleError(res, err.message, "Failed to find song with given sid to upvote.");
			} else {

				song.downvote(ip, function(err, doc) {
					if(err) {
						handleError(res, err.message, "Failed to save song after downvoting it.");

					} else {
						console.log("Broadcasting push:downvote...");
						io.emit('push:downvote', doc);  //TODO: abstract this out like pushQueue()
					}
				});
			}
		});
	});

	// RESET
	socket.on('send:reset', function() {
		Song.remove({}, function(err) {
			if (err) {
				handleError(res, err.message, "Failed to remove all songs from database.");
			} else {
				console.log('successfully removed all songs from database.');
				pushQueue(io);
			}
		});
	})
})};
