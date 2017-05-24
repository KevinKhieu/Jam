'use strict';

angular.module('controller', ['songServices', 'ngResource']).controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	'$resource',
	function($scope, songs, socket, socket_controller, $resource) {


		$scope.main = {};

		$scope.main.songName = "SHAPE OF YOU";
		$scope.main.artist = "ED SHEERAN";


		$scope.main.lastPlayedArtist = "No Previous Song";
		$scope.main.lastPlayedTitle = "";
		$scope.main.currentSong = "";

		$scope.FetchModel = function(url, callback) {

			// Create XMLHttpRequest and assign handler
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = xhrHandler;
			xhr.open("GET", url);
  			xhr.send();


			function xhrHandler(){
				// If we have an invalid state or status, log and return.
				if (this.readyState != 4 || this.status != 200) {
 					console.log("ERROR Status " + this.status + " state: " + this.readyState);
 					return;
 				}

 				// Otherwise call callback with model
 				var model = JSON.parse(this.responseText);
 				callback(model);
			};
 		};

		/* EVENT HANDLERS */

		$('.like-button').on('click', function() {
			$(this).toggleClass('liked');
		});

		$scope.main.toggleClick = function($event, id) {
			$event.target.parentElement.classList.toggle('liked');
			console.log(id);
			if ($event.target.parentElement.classList.contains('liked')) {
				console.log("LIKED");
				socket.emit('send:upvote', {'id': id} );
			} else {
				console.log("UNLIKED");
				socket.emit('send:downvote', {'id': id} );
			}
		}

		function handleAPILoaded() {
		  $('#search-button').attr('disabled', false);
		}

		// Search for a specified string.
		$scope.search = function () {
		  var q = $('#search_bar').val();
			//TODO: make a socketio route for search
		}

		function getRandomInt(min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		$scope.getNextSong = function() {
			var len = $scope.main.playlist.length;
			var song = $scope.main.playlist[getRandomInt(0, len)];
			return song;
		}

		/** Angular event handlers **/
		// $scope.FetchModel('/songList/', function(data) {
		//   	console.log(data);
		//   	// var dataSongs = [];
		//   	// for (var i = 0; i < data.length; i++) {
		//   	// 	var currSong = {
		//   	// 		name: data.songName,
		//   	// 		artist: data.artist,
		//
		//   	// 	}
		//   	// }
		//   	$scope.$apply(function() { // TODO: play music like this
		//   		$scope.main.playlist = data;
		//   		console.log($scope.main.playlist);
		//   		var aud = document.getElementById("audioElement");
		//   		var song = $scope.getNextSong();
		// 	    var songString = "music/" + song.link;
		// 	    aud.src = songString;
		// 	    $scope.main.songName = song.songName.toUpperCase();
		// 		$scope.main.artist = song.artist.toUpperCase();
		// 		$scope.main.currentSong = song;
		// 	    aud.play();
		//
		// 		aud.onended = function() {
		// 			$scope.$apply(function() {
		// 			    var song = $scope.getNextSong();
		// 			    var songString = "music/" + song.link;
		// 			    $scope.main.lastPlayedArtist = $scope.main.currentSong.songName;
		// 				$scope.main.lastPlayedTitle = $scope.main.currentSong.artist;
		// 			    aud.src = songString;
		// 			    aud.play();
		// 			    $scope.main.songName = song.songName.toUpperCase();
		// 				$scope.main.artist = song.artist.toUpperCase();
		// 			});
		// 		};
  	// 		});
		//  });

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
		};

		// UPVOTING //

		// $scope.upvote = function(song) {
		// 	console.log("Upvoting song " + song.spotifyId);
		// 	socket.emit('send:upvote', {'sid': song.spotifyId} );
		// };
		//
		// $scope.downvote = function(song) {
		// 	console.log("Downvoting song " + song.spotifyId);
		// 	socket.emit('send:downvote', {'sid': song.spotifyId} );
		// }

		$("#search_bar").on('keyup', function (e) {
			if (e.keyCode == 13) {
		        $scope.addSong();
		        // $scope.search();
						// $scope.reset();
		    }
		});

		// RESET
		$scope.main.reset = function() {
			console.log("sending reset");
			socket.emit('send:reset');
		};
}]);
