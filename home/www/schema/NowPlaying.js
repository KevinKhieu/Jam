"use strict";

/*
 * Mongoose: define schema and export model for the song that is Now Playing.
*/

var mongoose = require('mongoose');
var Song = require('./Songs');

var nowPlayingSchema = new mongoose.Schema({
  song: songSchema
});

var NowPlaying = mongoose.model('NowPlaying', nowPlayingSchema)
module.exports = nowPlaying
