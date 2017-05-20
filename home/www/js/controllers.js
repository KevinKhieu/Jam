'use strict';

angular.module('controller', ['songServices'])
.controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	function($scope, songs, socket, socket_controller) {

		/* DEBUGGING CONSTANTS */
		// 29kK_62LJV5bCprwtwIR1cKy
		// var OAUTH2_CLIENT_ID = '19440559455-6fb0ug0s2usen2ruv8eg3phcrfv97322.apps.googleusercontent.com';
		// var OAUTH2_SCOPES = [
		//   'https://www.googleapis.com/auth/youtube'
		// ];
		// // googleApiClientReady = function() {
		// //   gapi.auth.init(function() {
		// //     window.setTimeout(checkAuth, 1);
		// //   });
		// // }

		// function checkAuth() {
		//   gapi.auth.authorize({
		//     client_id: OAUTH2_CLIENT_ID,
		//     scope: OAUTH2_SCOPES,
		//     immediate: true
		//   }, handleAuthResult);
		// }

		// // Handle the result of a gapi.auth.authorize() call.
		// function handleAuthResult(authResult) {
		//   if (authResult && !authResult.error) {
		//     // Authorization was successful. Hide authorization prompts and show
		//     // content that should be visible after authorization succeeds.
		//     $('.pre-auth').hide();
		//     $('.post-auth').show();
		//     loadAPIClientInterfaces();
		//   } else {
		//     // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
		//     // client flow. The current function is called when that flow completes.
		//     $('#login-link').click(function() {
		//       gapi.auth.authorize({
		//         client_id: OAUTH2_CLIENT_ID,
		//         scope: OAUTH2_SCOPES,
		//         immediate: false
		//         }, handleAuthResult);
		//     });
		//   }
		// }

		// // Load the client interfaces for the YouTube Analytics and Data APIs, which
		// // are required to use the Google APIs JS client. More info is available at
		// // https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
		// function loadAPIClientInterfaces() {
		//   gapi.client.load('youtube', 'v3', function() {
		//     handleAPILoaded();
		//   });
		// }


		$scope.main = {};

		$scope.main.songName = "SHAPE OF YOU";
		$scope.main.artist = "ED SHEERAN";


		$scope.main.lastPlayedArtist = "The Chainsmokers";
		$scope.main.lastPlayedTitle = "Paris";

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
		  var q = $('#search_bar').val();
		  console.log(gapi);
		  var request = gapi.client.youtube.search.list({
		    q: q,
		    part: 'snippet'
		  });


		  request.execute(function(response) {
		    var str = JSON.stringify(response.result);
		    $('#search-container').html('<pre>' + str + '</pre>');
		  });
		}

		/** Angular event handlers **/
		$scope.main.playlist = songs.songs;

		// ADDING SONG //

		$scope.addSong = function() {
			$scope.sid = 'qq1337';  // TEMP - until addSong() is called from search results
			if(!$scope.sid || $scope.sid === '') { return; }
			var num = '' + $scope.main.playlist.length;
			var name = $scope.sid + num;
			socket.emit('send:add-song', {
				spotifyId: name,
				upvotes: [],
				name: 'Yellow',
				artist: 'Coldplay'
			});

			$scope.sid = '';
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
