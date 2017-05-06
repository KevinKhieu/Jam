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
