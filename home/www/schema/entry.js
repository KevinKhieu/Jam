"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Well Entry
 */
/* jshint node: true */

// EXAMPLE ENTRY SCHEME IN MONGO DB

var mongoose = require('mongoose');

// Entry Scheme used in webServer.js
var entrySchema = new mongoose.Schema({
	id: String,
	author: String,
	date: String,
	lat: Number
});

// Create model for schema
var Entry = mongoose.model('Entry', entrySchema);

// make this available to our users in our Node applications
module.exports = Entry;
