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
			if($scope.main.currentSong) {  // Set last played, if applicable
				$scope.main.lastPlayedArtist = $scope.main.currentSong.artist;
				$scope.main.lastPlayedTitle = $scope.main.currentSong.songName;
			}

			// set now playing display
			$scope.main.songName = song.songName.toUpperCase();
			$scope.main.artist = song.artist.toUpperCase();
			$scope.main.currentSong = song;
			//TODO: album artwork

			// actually start playing the song
			var aud = document.getElementById("audioElement");
			aud.src =  "music/" + song.link;
			var timestamp = undefined;
			aud.play();

			return timestamp;
		};

		function beginNextSong() {
			var song = songs.popNext();
			var timeStarted = _playNow(song);
			console.log("Now Playing: " + song.songName + " by " + song.artist);
			socket.emit('send:now-playing', {id: song.id, timeStarted: timeStarted} );
		}

		$scope.main.beginPlayback = function() {
			var aud = document.getElementById("audioElement");
			aud.onended = function() { $scope.$apply(beginNextSong) };

			beginNextSong();
		};

		// Receive playback events
		socket.on('push:now-playing', function(data) {
			var song = songs.popById(data.id);
			_playNow(song); // TODO: , data.timeStarted);
		});

		// RESET DB
		$scope.main.reset = function() {
			console.log("sending reset");
			socket.emit('send:reset');
		};

		$scope.main.test = function() {
			console.log("test button pressed");
		};
}]);
