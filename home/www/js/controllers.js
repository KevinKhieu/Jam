'use strict';


angular.module('controller', ['songServices'])
	.controller('MainController', ['$scope', 'songs', function($scope, songs) {

		/* DEBUGGING CONSTANTS */

		$scope.main = {};

		$scope.main.songName = "SHAPE OF YOU";
		$scope.main.artist = "ED SHEERAN";


		$scope.main.lastPlayedArtist = "The Chainsmokers";
		$scope.main.lastPlayedTitle = "Paris";

		/* EVENT HANDLERS */

		$('a.like-button').on('click', function() {
			$(this).toggleClass('liked');
		});

		/** Angular event handlers **/
		$scope.main.playlist = songs.songs;

		$scope.addSong = function() {
			$scope.sid = 'qq1337';  // TEMP - until addSong() is called from search results
			if(!$scope.sid || $scope.sid === '') { return; }

			songs.add({
				spotifyId: $scope.sid,
				upvotes: [],
				name: 'Yellow',
				artist: 'Coldplay'
			});

			$scope.sid = '';
		};

		$scope.reset = function() {
			songs.removeAll();
		};

}]);



// jamApp.controller('MainController', [
// '$scope',
// 'songs',
// 'socket',
// function ($scope, songs, socket) {
// 	$scope.songs = songs.songs;
//
// 	$scope.addSong = function(){
// 		if(!$scope.sid || $scope.sid === '') { return; }
//
// 		songs.create({
// 			spotifyId: $scope.sid,
// 			upvotes: []
// 		});
//
// 		$scope.sid = '';
// 	};
//
// 	$scope.incrementUpvotes = function(song) {
// 		songs.upvote(song);
// 	};
//
// 	$scope.reset = function() {
// 		songs.removeAll();
// 	};
//
// 	socket.on('ack:upvote', function(data) {
// 		console.log('received ack:upvote event');
// 		// console.dir(data);
// 		songs.updateOne(data.spotifyId, data.upvotes);
// 	});
//
// 	socket.on('upvote', function(data) {
// 		console.log('received upvote event');
// 		// console.dir(data);
// 		songs.updateOne(data.spotifyId, data.upvotes);
// 	});
//
// }]);
