"use strict";

var mongoose = require('mongoose');

var NO_PREVIOUS_SONG = "No Previous Song";

var nowPlayingSchema = new mongoose.Schema({
	id: String,  // If id === '', then there is no song currently playing.
	songName: String,
	artist: String,

	timeStarted: Number,  // timestamp

	lastPlayed: {
		songName: String,
		artist: String  // If lastPlayed.artist === 'No Previous Song', then there was no previous song.
	}
});

nowPlayingSchema.methods.update = function(song, timeStarted, callback, lastPlayed) {
	if(lastPlayed) {
		this.lastPlayed = lastPlayed;
	} else {
		this.lastPlayed = {songName: this.songName, artist: this.artist};
	}
	if(this.lastPlayed.artist === '') {
		this.lastPlayed.artist = NO_PREVIOUS_SONG;
	}
	console.log("lastPlayed artist: " + this.lastPlayed.artist);

	this.id = song.id;
	this.songName = song.songName;
	this.artist = song.artist;

	this.timeStarted = timeStarted;

	this.save(callback);
};

var NowPlaying = mongoose.model('NowPlaying', nowPlayingSchema);

module.exports = NowPlaying;
