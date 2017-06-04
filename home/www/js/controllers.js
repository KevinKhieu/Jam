'use strict';

angular.module('controller', ['songServices', 'ngResource']).controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	'$resource',
	function($scope, songs, socket, socket_controller, $resource) {

		$scope.main = {};

		$scope.main.nowPlaying = {
			songName: "",
			artist: ""
		};

		$scope.main.lastPlayed = {
			songName: "",
			artist: "No Previous Song"
		};


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

		$scope.main.playlist = songs.songs;

		// SEARCHING AND ADDING SONGS //

		function search() {
			socket.emit("get:search", {query: $scope.searchString});
			$scope.searchString = '';
		}

		// On press enter in the search bar, call search()
		$("#search_bar").on('keyup', function (e) {
			if (e.keyCode == 13) {
				$scope.$apply(search);
			}
		});

		// Convert Google Play Music API search results to our song format
		function resultsToSongs(results) {
			// TODO
			return {};
		}

		$scope.addSong = function() {
			console.log("TODO: Adding song " + $scope.searchString);
			// if(!$scope.searchString || $scope.searchString === '') { return; }
			// socket.emit('send:add-song', {
			// 	id: '' + $scope.main.playlist.length,
			// 	songName: $scope.searchString,
			// 	artist: $scope.searchString,
			// 	upvotes: [],
			// 	userAdded: "lucas-testing"
			// });

			$scope.searchString = '';
			console.log("TODO: searchString should be empty now...");
		};

		// PLAYBACK SECTION //

		function _playNow(link) {
			// actually start playing the song
			var aud = document.getElementById("audioElement");
			aud.src =  "music/" + link;
			var timestamp = undefined;
			aud.play();
		};

		function _setAsNowPlaying(newNowPlaying, newLastPlayed) {
			// set last played display
			// must set last played before now playing because
			// newLastPlayed may be $scope.main.nowPlaying
			$scope.main.lastPlayed = newLastPlayed;
			if(newLastPlayed.artist === "") newLastPlayed.artist = "No Previous Song";

			// set now playing display
			$scope.main.nowPlaying = newNowPlaying;
			//TODO: album artwork

			// TODO: seek bar
		}

		function _createNowPlaying(song) {
			return {
				id: song.id,
				songName: song.songName,
				artist: song.artist,

				isPlaying: false,
				timeResumed: undefined,
				resumedSeekPos: 0
			}
		}

		function beginNextSong() {
			var song = songs.popNext();
			console.log("Now Playing: " + song.songName + " by " + song.artist);

			_setAsNowPlaying(_createNowPlaying(song), $scope.main.nowPlaying);
			$scope.main.nowPlaying.timeResumed = _playNow(song.link);
			$scope.main.nowPlaying.isPlaying = true;

			socket.emit('send:now-playing', {
				np: $scope.main.nowPlaying,
				lp: $scope.main.lastPlayed
			});
		}

		$scope.main.beginPlayback = function() {
			var aud = document.getElementById("audioElement");
			aud.onended = function() { $scope.$apply(beginNextSong) };

			beginNextSong();
		};

		$scope.main.togglePlay = function() {
			var aud = document.getElementById("audioElement");

			if($scope.main.nowPlaying.isPlaying === false) {
				aud.play();
				$scope.main.nowPlaying.isPlaying = true;
				console.log('audio playing');
				socket.emit('send:play');

			} else {  // Pause
				aud.pause();
				$scope.main.nowPlaying.isPlaying = false;
				console.log('audio paused');
				socket.emit('send:pause');
			}
		};

		// Receive playback events from server

		socket.on('push:now-playing', function(data) {
			console.log("received push:now-playing");
			songs.removeById(data.np.id);
			_setAsNowPlaying(data.np, data.lp);
			// DO NOT actually play the song's audio - just display it as now playing.
		});

		socket.on('push:play', function() {
			console.log('received push:play');
			$scope.main.nowPlaying.isPlaying = true;
		});

		socket.on('push:pause', function() {
			console.log('received push:pause');
			$scope.main.nowPlaying.isPlaying = false;
		});

		socket.on('send:search', function(results) {
			var songResults = resultsToSongs(results);
			$scope.main.playlist = songResults;
		});

		// RESET DB
		$scope.main.reset = function() {
			console.log("sending reset");
			socket.emit('send:reset');
		};

		// DEBUG
		$scope.main.test = function() {
			console.log("test button pressed");
			console.dir($scope.main.currentSong);
		};
}]);
