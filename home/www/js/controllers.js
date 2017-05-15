'use strict';

angular.module('controller', ['songServices'])
.controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	function($scope, songs, socket, socket_controller) {

		/* DEBUGGING CONSTANTS */

		$scope.main = {};

		$scope.main.songName = "SHAPE OF YOU";
		$scope.main.artist = "ED SHEERAN";


		$scope.main.lastPlayedArtist = "The Chainsmokers";
		$scope.main.lastPlayedTitle = "Paris";

		/* EVENT HANDLERS */

		$('.like-button').on('click', function() {
			$(this).toggleClass('liked');
		});

		$scope.main.toggleClick = function($event, id) {
			$event.target.parentElement.classList.toggle('liked');

			if ($event.target.parentElement.classList.contains('liked')) {
				console.log("LIKED")
				
			} else {
				console.log("UNLIKED")
			}
		}

		/** Angular event handlers **/
		$scope.main.playlist = songs.songs;

		// ADDING SONG //

		$scope.addSong = function() {
			$scope.sid = 'qq1337';  // TEMP - until addSong() is called from search results
			if(!$scope.sid || $scope.sid === '') { return; }

			socket.emit('send:add-song', {
				spotifyId: $scope.sid,
				upvotes: [],
				name: 'Yellow',
				artist: 'Coldplay'
			});

			$scope.sid = '';
		};

		// UPVOTING //

		$scope.upvote = function(song) {
			console.log("Incrementing upvotes on " + song.spotifyId);
			socket.emit('send:upvote', {'sid': song.spotifyId} );
		};

		$("#search_bar").on('keyup', function (e) {
		    if (e.keyCode == 13) {
		        $scope.addSong();
		    }
		});
		// RESET
		$scope.reset = function() {
			socket.emit('send:reset');
		};
}]);
