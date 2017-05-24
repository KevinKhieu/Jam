'use strict';

// var Song = require('../schema/Songs');
var Entry = require('../schema/entry');
var hardcodedMusicData = require('../data.json');

// Generic error handler
function handleError(transport, reason, message, code) {
	console.log("ERROR: " + message);
	console.log("\t" + reason);
	transport.emit('server-error', {"reason": reason, "message": message, "code": code});
}

function pushQueue(transport) {
	/* Gets the entire song queue from the database and emits it via the given
	 * transport as a push:queue. The transport should either be a socket, or the
	 * io object itself. A socket to send to that socket; io to send to all sockets. */
	Entry.find(function(err, songs) {
		if(err) {
			handleError(transport, err.message, "Failed to retrieve song list.");
		} else {
			console.log('emitting push:queue: ' + songs.length);
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
		console.log("received send:add-song: ");
		console.dir(data);
		// var song = new Entry(data);
		// song.save(function(err, song){
		// 	if(err){
		// 		handleError(socket, err.message, "Failed to add song to list.");
		// 	} else {
		// 		console.log("Broadcasting push:add-song...");
		// 		// socket.emit('push:add-song', song);
		// 		// socket.broadcast.emit('push:add-song', song);
		// 		io.emit('push:add-song', song);
		// 	}
		// });
	});

	// UPVOTING //
	socket.on('send:upvote', function(data) {
		var songId = data.id;
		var ip = getIP(socket);
		console.log('user at ip ' + ip + ' upvoted ' + songId);

		Entry.findOne({'id': songId}, function(err, song) { //TODO: make sure calling findOne correctly
			if(err) {
				handleError(socket, err.message, "Failed to find song with given songId to upvote.");
			} else {

				song.upvote(ip, function(err, doc) {
					if(err) {
						handleError(socket, err.message, "Failed to save song after upvoting it.");

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
				handleError(socket, err.message, "Failed to find song with given sid to upvote.");
			} else {

				song.downvote(ip, function(err, doc) {
					if(err) {
						handleError(socket, err.message, "Failed to save song after downvoting it.");

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
		console.log("RESETTING DB...");

		// clear
		Entry.remove({}, function(err) {
			if (err) {
				return handleError(socket, err.message, "Failed to remove all songs from database.");
			}
			console.log('  successfully removed all songs from database');

			// re-add hardcoded data
			Entry.create(hardcodedMusicData, function(err) {
				if(err) {
					return handleError(socket, err.message, "Failed to add hardcoded data to database.");
				}
				console.log('  successfully re-added hardcoded music data');
				pushQueue(io);
			});
		});

	});
})};
