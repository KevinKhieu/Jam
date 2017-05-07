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
	return socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
}

exports.initSocketConnection = function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});

	// UPVOTING //
	socket.on('send:upvote', function(data) {
		var sid = data.sid;
		var ip = getIP(socket);
		console.log('user at ip ' + ip + ' upvoted ' + sid);

	});
};
