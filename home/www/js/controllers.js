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


		$scope.main.lastPlayedArtist = "The Chainsmokers";
		$scope.main.lastPlayedTitle = "Paris";

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

 		$scope.FetchModel('/firstData/', function(dbCount) {
 			console.log("DB COUNT: " + dbCount);
 			$scope.FetchModel('/clearMongo/', function(model) {
	            var data = model;
	            var funcs = [];
	            console.log(data.length);
	            // For each entry in data.json, create an Entry document in our entries database
	            for (var i = 0; i < data.length; i++) {
	              funcs[i] = (function (i) {
	              	console.log(data[i]);
	                // Set proper parameters as specified in data.json
	                var currentReq = $resource('/entry');
	                var songName = data[i].songName;
	                var artist = data[i].artist;
	                var link = data[i].link;
	                var numVotes = data[i].numVotes;
	                var songId = data[i].songId;
	                if (numVotes == null) {
	                  numVotes = 0;
	                }

	                // Save request.
	                currentReq.save({
	                	songName: data[i].songName,
	                	artist: data[i].artist,
	                	link: data[i].link,
	                	upvotes: data[i].numVotes,
	                	songId: data[i].songId,
	                	userAdded: "Kevin"
	                }, function(ret) {
	                  console.log("Done");
	                });
	              }(i));
	            }
			})
		});

		/* EVENT HANDLERS */

		$('.like-button').on('click', function() {
			$(this).toggleClass('liked');
		});

		$scope.main.toggleClick = function($event, id, votes) {
			$event.target.parentElement.classList.toggle('liked');
			console.log(id);
			if ($event.target.parentElement.classList.contains('liked')) {
				console.log("LIKED");
				socket.emit('send:upvote', {'sid': id} );
			} else {
				console.log("UNLIKED");
				socket.emit('send:downvote', {'sid': id} );
			}
		}

		function handleAPILoaded() {
		  $('#search-button').attr('disabled', false);
		}

		// Search for a specified string.
		$scope.search = function () {
		  // var q = $('#search_bar').val();
		  // console.log(gapi);
		  // var request = gapi.client.youtube.search.list({
		  //   q: q,
		  //   part: 'snippet'
		  // });


		  // request.execute(function(response) {
		  //   var str = JSON.stringify(response.result);
		  //   $('#search-container').html('<pre>' + str + '</pre>');
		  // });
		  $scope.FetchModel('/songList/', function(data) {
		  	console.log(data);
		  })
		}

		/** Angular event handlers **/
		$scope.main.playlist = songs.songs;

		// ADDING SONG //

		$scope.addSong = function() {
			$scope.FetchModel('/songList/', function(data) {
			  	console.log(data);
			  })
			// $scope.sid = 'qq1337';  // TEMP - until addSong() is called from search results
			// if(!$scope.sid || $scope.sid === '') { return; }
			// var num = '' + $scope.main.playlist.length;
			// var name = $scope.sid + num;
			// socket.emit('send:add-song', {
			// 	spotifyId: name,
			// 	upvotes: [],
			// 	name: 'Yellow',
			// 	artist: 'Coldplay'
			// });

			// $scope.sid = '';
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
		$scope.reset = function() {
			socket.emit('send:reset');
		};
}]);
