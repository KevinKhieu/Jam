'use strict';

// var Song = require('../schema/Songs');
var Entry = require('../schema/entry');
var NowPlaying = require('../schema/now-playing');
var LastPlayed = require('../schema/last-played');
var hardcodedMusicData = require('../data.json');
var googlePlayAPI = require('../google-music/googleMusic');
var PlayMusic = require('../google-music/play');

// Initialize Google Music API
var pm = new PlayMusic();
googlePlayAPI.initialize(pm, function() {
	console.log('successfully initialized google play api');
}, function(err) {
	console.log("failed to initialize google play api");
});

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
			handleError(transport, err.message, "Failed to find song with given id to " + n + "vote.");
		} else {

			song[n + 'vote'] (ip, function(err, doc) {
				if(err) {
					handleError(transport, err.message, "Failed to " + n + "vote song.");

				} else {
					console.log("Broadcasting push:" + n + "vote...");
					transport.emit('push:' + n + 'vote', doc);
				}
			});
		}
	});
}

function getIP(socket) {
	return socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
}

exports.initSocketConnection = function(io) {

// Initialize database
NowPlaying.init(io);

// Set handlers for socket events
io.sockets.on('connection', function(socket) {

	var is_room_host = false;
	socket.on('send:i-am-room-host', function() {
		is_room_host = true;
		console.log('room host connected');
	});

	var ip = getIP(socket);
	socket.emit('send:your-ip', ip);

	console.log('a user connected with IP ' + ip + '.');

	pushQueue(socket);
	NowPlaying.push(socket);

	socket.on('disconnect', function() {
		console.log('a user disconnected');
		if(is_room_host) {
			console.log('room host disconnected! Clearing now playing.');
			NowPlaying.clear();
		}
	});

	// ADDING SONG //
	socket.on('send:add-song', function(song) {
		console.log("received send:add-song: " + song.songName + " by " + song.artist);
		var song = new Entry(song);
		song.save(function(err, song) {
			if(err){
				handleError(socket, err.message, "Failed to add song to list.");
			} else {
				console.log("Broadcasting push:add-song...");
				io.emit('push:add-song', song);
			}
		});
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

		if(data) {  // True unless we've reached the end of the queue
			console.log('now playing: ' + data.id);
			console.log('album id: ' + data.albumId);
			Entry.findOne({ id:data.id }).remove(function(err) {
				if(err) {
					handleError(socket, err.message, "DB: Failed to remove now-playing song from queue.");
				} else {
					console.log("Successfully removed now-playing song from DB queue.");

					// Get urls of Now Playing song
					googlePlayAPI.getStreamURL(pm, data, function(songUrl) {
						googlePlayAPI.getAlbumURL(pm, data, function(albumUrl) {
							data.songUrl = songUrl;
							data.albumUrl = albumUrl;
							data.isPlaying = true;
							NowPlaying.set(data);
						});
					});
				}
			});
		} else {  // we've reached the end of the queue
			NowPlaying.clear();
		}
	});

	socket.on('send:play', function() {
		console.log('music is now playing');
		NowPlaying.get(function(np) {
			np.isPlaying = true;
			np.save(function(np) {
				socket.broadcast.emit('push:play');
			});
		});
	});

	socket.on('send:pause', function() {
		console.log('music is now paused');
		NowPlaying.get(function(np) {
			np.isPlaying = false;
			np.save(function(np) {
				socket.broadcast.emit('push:pause');
			});
		});
	});

	/* Dedupes any two adjacent songs with same name and artist. */
	function filterUniques(results) {
		var unique_songs = [];
		for (var i = 0; i < results.length - 1; i+=2) {
			if (results[i].songName === results[i + 1].songName && results[i].artist === results[i + 1].artist) {
				console.log('detected duplicate');
				unique_songs.push(results[i+1]);
			} else {
				unique_songs.push(results[i]);
				unique_songs.push(results[i+1]);
			}
		}
		return unique_songs;
	}

	socket.on('get:search', function(data) {
		console.log('getting search for ' + data.query);
		googlePlayAPI.search(pm, data.query, function(results) {
			results = filterUniques(results);
			socket.emit('send:search', {results: results});
		});
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

			pushQueue(io);
		});

		NowPlaying.reset();
	});
})};
