'use strict';

angular.module('controller', ['songServices', 'ngResource']).controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	'$resource',
	function($scope, songs, socket, socket_controller, $resource) {

		$scope.main = {};

		$scope.main.songName = "";
		$scope.main.artist = "";

		$scope.main.lastPlayedArtist = "No Previous Song";
		$scope.main.lastPlayedTitle = "";
		$scope.main.currentSong = "";

		/* EVENT HANDLERS */

		$scope.main.toggleClick = function($event, id) {

			// Figured out the liking glitch! Different parts of the heart are considered
			// the event target depending on exactly where you click.
			if ($event.target.classList.contains('liked')
			 || $event.target.parentElement.classList.contains('liked')
			 || $event.target.parentElement.parentElement.classList.contains('liked')
			) {
				// we will 'unlike' it
				socket.emit('send:downvote', {'id': id} );
			} else {
				// we will 'like' it
				socket.emit('send:upvote', {'id': id} );
			}

			console.log("heart clicked for " + id);
		}

	//TODO: Kevin, is there a #search-button anywhere anymore? This code may not be doing anything.
		function handleAPILoaded() {
			$('#search-button').attr('disabled', false);
		}

		// Search for a specified string.
		$scope.search = function () {
			var q = $('#search_bar').val();
			//TODO: make a socketio route for search
		}

		$scope.main.playlist = songs.songs;

		// ADDING SONG //

		$scope.addSong = function() {
			console.log("Adding song " + $scope.searchString);
			if(!$scope.searchString || $scope.searchString === '') { return; }
			socket.emit('send:add-song', {
				id: '' + $scope.main.playlist.length,
				songName: $scope.searchString,
				artist: $scope.searchString,
				upvotes: [],
				userAdded: "lucas-testing"
			});

			$scope.searchString = '';
			console.log("TODO: searchString should be empty now...");
		};

		$("#search_bar").on('keyup', function (e) {
			if (e.keyCode == 13) {
						$scope.addSong();
						// $scope.search();
						// $scope.reset();
				}
		});

		// PLAYBACK SECTION //

		function _playNow(song) {
			// actually start playing the song
			var aud = document.getElementById("audioElement");
			aud.src =  "music/" + song.link;
			var timestamp = undefined;
			aud.play();

			return timestamp;
		};

		function _setAsNowPlaying(song) {
			if(song.lastPlayed === undefined) {  // true when this is the host-client (except for on page load call)
				if($scope.main.currentSong) {  // true every time except on initial page load call

					$scope.main.lastPlayedArtist = $scope.main.currentSong.artist;
					if($scope.main.lastPlayedArtist === '')  // true for the first song played
						$scope.main.lastPlayedArtist = "No Previous Song";
					$scope.main.lastPlayedTitle = $scope.main.currentSong.songName;
				}
			} else {
				$scope.main.lastPlayedArtist = song.lastPlayed.artist;
				$scope.main.lastPlayedTitle = song.lastPlayed.songName;
			}

			// set now playing display
			$scope.main.songName = song.songName.toUpperCase();
			$scope.main.artist = song.artist.toUpperCase();
			$scope.main.currentSong = song;
			//TODO: album artwork

			// TODO: seek bar
		}

		function beginNextSong() {
			var song = songs.popNext();
			console.log("Now Playing: " + song.songName + " by " + song.artist);
			_setAsNowPlaying(song);
			var timeStarted = _playNow(song);
			socket.emit('send:now-playing', {id: song.id, timeStarted: timeStarted} );
		}

		$scope.main.beginPlayback = function() {
			var aud = document.getElementById("audioElement");
			aud.onended = function() { $scope.$apply(beginNextSong) };

			beginNextSong();
		};

		// Receive playback events from server

		socket.on('push:now-playing', function(data) {
			console.log("received push:now-playing");
			songs.removeById(data.id);
			_setAsNowPlaying(data);
			// DO NOT actually play the song's audio - just display it as now playing.
		});

		// RESET DB
		$scope.main.reset = function() {
			console.log("sending reset");
			socket.emit('send:reset');
		};

		$scope.main.test = function() {
			console.log("test button pressed");
			console.dir($scope.main.currentSong);
		};
}]);
