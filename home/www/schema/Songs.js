"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Song
 */

var mongoose = require('mongoose');

var upvoteSchema = new mongoose.Schema({ ip: 'String' });

var songSchema = new mongoose.Schema({
	spotifyId: String,  // TODO: Figure out based on which API we are using
		//TODO: Make this a required field
	upvotes: [upvoteSchema]
});

songSchema.methods.upvote = function(ip, cb) {
	this.upvotes.push({ip: ip});
	this.save(cb);
};

// Create model for schema
var Song = mongoose.model('Song', songSchema);

// make this available to our users in our Node applications
module.exports = Song;
