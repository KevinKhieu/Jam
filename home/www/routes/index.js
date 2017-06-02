'use strict';

// var Song = require('../schema/Songs');
var Entry = require('../schema/entry');
var NowPlaying = require('../schema/now-playing');
var hardcodedMusicData = require('../data.json');

// Generic error handler
function handleError(transport, reason, message, code) {
	console.log("ERROR: " + message);
	console.log("\t" + reason);
	if(transport)
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
			console.log('emitting push:queue: ' + songs.length + ' items in queue');
			transport.emit('push:queue', songs);
		}
	});
}

function applyVote(n, songId, ip, transport) {
	console.log('user at ip ' + ip + ' ' + n + 'voted ' + songId);

	Entry.findOne({'id': songId}, function(err, song) {
		if(err) {
			handleError(socket, err.message, "Failed to find song with given id to " + n + "vote.");
		} else {

			song[n + 'vote'] (ip, function(err, doc) {
				if(err) {
					handleError(socket, err.message, "Failed to " + n + "vote song.");

				} else {
					console.log("Broadcasting push:" + n + "vote...");
					transport.emit('push:' + n + 'vote', doc);
				}
			});
		}
	});
}

function getNowPlaying(callback) {
	NowPlaying.findOne(function(err, np) {
		if(err) {
			handleError(undefined, err.message, "Failed to get NowPlaying db data");
		} else {
			callback(np);
		}
	});
}

function setNowPlaying(song, timeStarted, callback, lastPlayed) {
	getNowPlaying(function(np) {
		np.update(song, timeStarted, callback, lastPlayed);
	});
}

function initNowPlaying() {
	getNowPlaying(function(np) {
		if(np == null || np.length === 0) {
			NowPlaying.create({
				id: '',
				timeStarted: 0,
				playState: false,

				songName: '',
				artist: '',
				lastPlayed: {
					songName: '',
					artist: ''
				}
			});
		}
	});
}
initNowPlaying();

function pushNowPlaying(transport) {
	getNowPlaying(function(np) {
		transport.emit('push:now-playing', np);
	});
}

function getIP(socket) {
	return socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
}

exports.initSocketConnection = function(io) {
io.sockets.on('connection', function(socket) {

	var ip = getIP(socket);
	socket.emit('send:your-ip', ip);

	console.log('a user connected with IP ' + ip + '.');

	pushQueue(socket);
	pushNowPlaying(socket);

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
		applyVote('up', data.id, ip, io);
	});

	// DOWNVOTING //
	socket.on('send:downvote', function(data) {
		applyVote('down', data.id, ip, io);
	});

	// MEDIA CONTROL FROM ROOM HOST //

	socket.on('send:now-playing', function(data) {
		console.log('now playing: ' + data.id);

		Entry.findOne({ id:data.id }, function(err, song) {
			if(err) {
				handleError(socket, err.message, "Failed to find now-playing song in queue.");
			} else {
				if(song !== null) {
					setNowPlaying(song, data.timeStarted, function(err, nowPlaying) {
						socket.broadcast.emit('push:now-playing', nowPlaying);
					});
				}
			}
		}).remove(function(err) {
			if(err) {
				handleError(socket, err.message, "DB: Failed to remove now-playing song from queue.");
			} else {
				console.log("Successfully removed now-playing song from DB queue.");
			}
		});
	});

	socket.on('send:play', function() {
		console.log('music is now playing');
		socket.broadcast.emit('push:play');
	});

	socket.on('send:pause', function() {
		console.log('music is now paused');
		socket.broadcast.emit('push:pause');
	});


	// RESET
	socket.on('send:reset', function() {
		console.log("RESETTING DB...");

		// reset queue
		Entry.remove({}, function(err) {
			if (err) {
				return handleError(socket, err.message, "Failed to remove all songs from database.");
			}
			console.log('  successfully removed all songs from database');

			// re-add hardcoded data
			Entry.create(hardcodedMusicData, function(err) {
				if(err) {
					handleError(socket, err.message, "Failed to add hardcoded data to database.");
				} else {
					console.log('  successfully re-added hardcoded music data');
					pushQueue(io);
				}
			});
		});

		// clear now playing
		setNowPlaying({
			id: '',
			songName: '',
			artist: ''
		}, 0, function(err, np) {
			if(err) {
				handleError(socket, err.message, "Failed to set now playing in database.");
			} else {
				console.log('  successfully cleared DB now playing');
				pushNowPlaying(io);
			}
		}, {
			songName: '',
			artist: ''
		});

	});
})};
