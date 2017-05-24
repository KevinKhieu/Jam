"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Well Entry
 */
/* jshint node: true */

// EXAMPLE ENTRY SCHEME IN MONGO DB

var mongoose = require('mongoose');

var upvoteSchema = new mongoose.Schema({ ip: 'String' });

// Entry Schema used in webServer.js
var entrySchema = new mongoose.Schema({
	id: String,
	songName: String,
	artist: String,
	upvotes: [upvoteSchema],
	link: String,
	userAdded: String
});

entrySchema.methods.upvote = function(ip, callback) {
	this.upvotes.push({ip: ip});
	this.save(callback);
};

// Create model for schema
var Entry = mongoose.model('Entry', entrySchema);

// make this available to our users in our Node applications
module.exports = Entry;
