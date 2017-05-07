"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Song
 */

var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({
	spotifyId: String,  // TODO: Ask Manny about this
	upvotes: Number
});

songSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
};

// Create model for schema
var Song = mongoose.model('Song', songSchema);

// make this available to our users in our Node applications
module.exports = Song;
