'use strict';

angular.module('controller', ['songServices', 'ngResource']).controller('MainController', [
	'$scope',
	'songs',
	'socket',
	'socket-controller',
	'$resource',
	function($scope, songs, socket, socket_controller, $resource) {

		$scope.main = {};

		// $scope.main.nowPlaying = {
		// 	songName: "",
		// 	artist: ""
		// };
		//
		// $scope.main.lastPlayed = {
		// 	songName: "",
		// 	artist: "No Previous Song"
		// };

		$scope.main.searchResults = false;
		$scope.main.searchList = [];
		$scope.main.imgURL = "img/noImg.png";

		$scope.main.thisIsHost = document.getElementById("THIS_IS_HOST") != null;
		$scope.main.queuedSong = null;		// STORES QUEUED SONG ID
		$scope.main.currDropdown = null;

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
				songs.iVoted(id, false);
			} else {
				// we will 'like' it
				socket.emit('send:upvote', {'id': id} );
				songs.iVoted(id, true);
			}

			console.log("heart clicked for " + id);
		};

		$scope.main.addClick = function($event, id, index) {
			if ($event.target.classList.contains('add')
			 || $event.target.parentElement.classList.contains('add')
			 || $event.target.parentElement.parentElement.classList.contains('add')
			) {
				// we will 'unlike' it
				$scope.addSong($scope.main.searchList[index]);
				$event.target.classList.remove('add')
			 	$event.target.parentElement.classList.remove('add')
			 	$event.target.parentElement.parentElement.classList.remove('add')
			 	$event.target.src = "img/check.png"
			} else {
				// we will 'like' it
				console.log("Already added");
			}

			// console.log("heart clicked for " + id);
		};

		$scope.main.playlist = songs.songs;

		// SEARCHING AND ADDING SONGS //

		function search() {
			socket.emit("get:search", {query: $scope.searchString});
			//$scope.searchString = '';
		}

		var typingTimer;                //timer identifier
		var doneTypingInterval = 250;  //time in ms (5 seconds)
		// On press enter in the search bar, call search()
		$("#search_bar").on('keyup', function (e) {
			// if (e.keyCode == 13) {
			// 	$scope.$apply(search);
			// }
			clearTimeout(typingTimer);
			if (this.value) {
				typingTimer = setTimeout(doneTyping, doneTypingInterval);

				function doneTyping() {
					$scope.$apply(search);
					$scope.main.searchResults = true;
				}

			} else {
				console.log("EMPTY");
				$scope.$apply(function() {
					$scope.main.searchResults = false;
				});
			}
		});

		document.addEventListener('click', function(e) {
			var el = $(e.target);
			if (el.parents('div#targetArea').length) {

			} else {
				$("#search_bar").value = '';
				$scope.$apply(function() {
					$scope.main.searchResults = false;
				});
			}
		});

		function filterOutSongsAlreadyAdded(results) {
			var newResults = [];
			results.forEach(function(result) {
				if (!songs.contains(result.id)) {
					newResults.push(result);
				}
			});
			return newResults;
		}

		$scope.addSong = function(song) {
			console.log('adding song: ' + song.id);
			socket.emit('send:add-song', song);
			// $("#search_bar").value = '';
			// $scope.main.searchResults = false;
		};

		// PLAYBACK SECTION //

		// When host starts playing music, send timestamp for playback synchronization
		if($scope.main.thisIsHost) {
			document.getElementById("audioElement").onplay = function() {
				socket.emit('send:resumed-time', {
					resumedSeekPos: 0,  // time offset from beginning of song
					timeResumed: Date.now() / 1000  // timestamp
				});
			};
		}

		function _synchronizeSeekPosition() {
			var seekPos = $scope.main.nowPlaying.resumedSeekPos;  // seconds
			console.log("resumedSeekPos: " + seekPos);

			var timestamp = Date.now() / 1000;

			var latency = timestamp - $scope.main.nowPlaying.timeResumed;  // seconds
			console.log(timestamp + " - " + $scope.main.nowPlaying.timeResumed + " = " + latency);

			console.log('being assigned to aud.currentTime: ' + seekPos + latency);
			return seekPos + latency;
		}

		function _setAsNowPlaying(newNowPlaying) {
			$scope.main.nowPlaying = newNowPlaying;

			// seek to correct position if not the host
			if(!$scope.main.thisIsHost
				 && $scope.main.nowPlaying.isPlaying
				 && $scope.main.nowPlaying.timeResumed
					// if timeResumed is undefined, we received the original now-playing event
					// fired when the host started playing the song, and we should just
					// start the song at the beginning.
				) {
				var aud = document.getElementById("audioElement");
				aud.currentTime = _synchronizeSeekPosition();

			}

			// TODO: seek bar
		}

		function beginNextSong() {
			
			var song = null;
			if ($scope.main.queuedSong == null) {
				song = songs.popNext();
			} else {
				song = $scope.main.queuedSong;
				$scope.main.queuedSong = null;
				removeShimmers();
				songs.removeById(song.id);
			}
			socket.emit('send:now-playing', song);
		}

		function beginPlayback() {
			if(songs.songs.length === 0) return;

			var aud = document.getElementById("audioElement");
			aud.onended = function() { $scope.$apply(beginNextSong) };
			beginNextSong();
		};

		function play() {
			var aud = document.getElementById("audioElement");
			aud.play();
			// if(!$scope.main.thisIsHost) {
			// 	aud.currentTime = _synchronizeSeekPosition();
			// }

			$scope.main.nowPlaying.isPlaying = true;

			console.log('audio playing');
			if($scope.main.thisIsHost) {
				socket.emit('send:play');
			}
		};

		function pause() {
			var aud = document.getElementById("audioElement");
			aud.pause();

			$scope.main.nowPlaying.isPlaying = false;

			console.log('audio paused');
			if($scope.main.thisIsHost) {
				socket.emit('send:pause');
			}
		};

		$scope.main.togglePlay = function() {
			if($scope.main.nowPlaying.songName === "No Current Song") {
				beginPlayback();
			} else {
				if($scope.main.nowPlaying.isPlaying) {
					pause();
				} else {
					play();
				}
			}
		};

		$scope.main.Skip = function() {
			beginNextSong();
		};

		// Receive playback events from server

		socket.on('push:now-playing', function(np) {
			if(!$scope.main.thisIsHost) {  // not on host
				songs.removeById(np.id);
			}

			console.log("Now Playing: " + np.songName + " by " + np.artist);
			_setAsNowPlaying(np);
		});

		socket.on('push:play', function() {
			console.log('received push:play');
			play();
		});

		socket.on('push:pause', function() {
			console.log('received push:pause');
			pause();
		});

		// Receive Google Music API search results back from server
		socket.on('send:search', function(data) {
			var newResults = filterOutSongsAlreadyAdded(data.results);
			$scope.main.searchList = newResults;
		});

		// RESET DB
		$scope.main.reset = function() {
			console.log("sending reset");
			socket.emit('send:reset');
		};

		$scope.main.toggleSound = function () {
			if (document.getElementById('playCheck').checked) 
			  {
			      console.log("checked");
			  } else {
			      console.log("unchecked");
			  }
		}

		$scope.main.showOptions = function($event, id) {
			var x = $event.target.parentElement.childNodes[1];
			$scope.main.currDropdown = x;
			console.log(x);
		    if (x.className.indexOf("w3-show") == -1) {
		        x.className += " w3-show";
		    } else { 
		        x.className = x.className.replace(" w3-show", "");
		    }
		}

		function hideOptions() {
			console.log($scope.main.currDropdown);
			if ($scope.main.currDropdown) {
				console.log("HI");
				$scope.main.currDropdown.className = $scope.main.currDropdown.className.replace(" w3-show", "");
			} else {
				console.log("BYE");
			}
		}

		function removeShimmers() {
			var x = document.getElementsByClassName("shimmer");
			if (x.length == 0) return;
			console.log(x)
			for (var i = 0; i < x.length; i++) {
				x[i].className = x[i].className.replace(" shimmer", "");
			}
		}

		$scope.main.queueNext = function($event, id) {
			console.log(id);
			console.log(songs);
			var result = $.grep(songs.songs, function(e){ return e.id == id; });
			if (result.length == 1) {
				$scope.main.queuedSong = result[0];
				console.log($scope.main.queuedSong);
				removeShimmers();
				console.log($event.target.parentElement.parentElement.childNodes[5]);
				$event.target.parentElement.parentElement.childNodes[5].className += " shimmer";
			}
			hideOptions();
		}

		// DOES NOT WORK TEARS
		$scope.main.removeSong = function($event, id) {
			console.log(id);
			songs.removeById(id);
			hideOptions();
		}
}
]);
