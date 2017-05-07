'use strict';

var jamApp = angular.module('jamApp', ['ngRoute', 'ngMaterial', 'ngResource']);

$(document).ready(function() {
  // initialization
  SC.initialize({
    client_id: "15c5a12b5d640af73b16bd240753ffbb"
  });

  // Play audio
  $("#embedTrack").click(function() {
    var player = $("#player");
    SC.oEmbed('https://soundcloud.com/mureed-abbas-shah/sami-meri-waar-by-qb-umair', {
      maxheight: 200
    }, function(res) {
      $("#player").html(res.html);
    });
  });

  // SC.get('/tracks', {
  //   q: 'Boyce Avenue',
  //   license: 'cc-by-sa'
  //   }, function(tracks) {
  //     console.log(tracks);
  //   });

    SC.stream('/tracks/293').then(function(player){
      player.play();
    });
})

jamApp.controller('MainController', ['$scope', '$rootScope', '$location', '$http', '$routeParams', '$resource', '$mdDialog', '$mdMedia',
    function ($scope, $rootScope, $location, $http, $routeParams, $resource, $mdDialog, $mdMedia) {

    	$scope.main = {};


    	$scope.main.songName = "SHAPE OF YOU";
    	$scope.main.artist = "ED SHEERAN";


    	$scope.main.lastPlayedArtist = "The Chainsmokers";
    	$scope.main.lastPlayedTitle = "Paris"


    	$scope.main.playlist = [{name: "Yellow", artist: "Coldplay"},
    		{name: "Fireflies", artist: "Owl City"},
    		{name: "Stained Glass", artist: "John Guerra"},
    		{name: "Perfect", artist: "One Direction"},
    		{name: "Firework", artist: "Katy Perry"},
    		{name: "Where The Story Ends", artist: "The Fray"},
    		{name: "You Found Me", artist: "The Fray"},
    		{name: "Castle on the Hill", artist: "Ed Sheeran"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"}];


        $('a.like-button').on('click', function() {
          $(this).toggleClass('liked');
        });


}]);



// var jamApp = angular.module('jamApp', ['ui.router']);
// >>>>>>> b82c51175a94d4c0c97a62f7326597e2a1ada306
//
// jamApp.config([
// '$stateProvider',
// '$urlRouterProvider',
// function($stateProvider, $urlRouterProvider) {
//
// 	$stateProvider
// 		.state('home', {
// 			url: '/home',
// 			templateUrl: '/home.html',
// 			controller: 'MainController',
// 			resolve: {
// 				songPromise: ['songs', function(songs) {
// 					return songs.getAll();
// 				}]
// 			}
// 		});
//
// 	$urlRouterProvider.otherwise('home');
// }]);
//
// jamApp.factory('socket', ['$rootScope', function($rootScope) {
// 	var socket = io.connect();
// 	var o = {};
// 	o.on = function (eventName, callback) {
//     socket.on(eventName, function () {
//       var args = arguments;
//       $rootScope.$apply(function () {
//         callback.apply(socket, args);
//       });
//     });
//   };
//   o.emit = function (eventName, data, callback) {
//     socket.emit(eventName, data, function () {
//       var args = arguments;
//       $rootScope.$apply(function () {
//         if (callback) {
//           callback.apply(socket, args);
//         }
//       });
//     });
//   };
// 	return o;
// }]);
//
// jamApp.factory('songs', ['$http', 'socket', function($http, socket){
// 	var o = {
// 		songs: []
// 	};
//
// 	o.getAll = function() {
// 		return $http.get('/songs').success(function(data) {
// 			angular.copy(data, o.songs);
// 		});
// 	};
//
// 	o.create = function(song) {
// 		return $http.post('/songs', song).success(function(data) {
// 			o.songs.push(data);
// 		});
// 	};
//
// 	o.upvote = function(song) {
// 		socket.emit('send:upvote', {'sid': song.spotifyId} );
// 	};
//
// 	o.updateOne = function(sid, upvotes) {
// 		var i = o.songs.findIndex(function(song) {
// 			return song.spotifyId == sid;  // TODO: double or triple equals?
// 		});
// 		o.songs[i].upvotes = upvotes;
// 	};
//
// 	o.removeAll = function() {
// 		return $http.get('/reset').success(function(data) {
// 			console.log(data);
// 			o.getAll();
// 		});
// 	};
//
// 	return o;
// }]);
//
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
