'use strict';

var jamApp = angular.module('jamApp', ['ui.router']);

jamApp.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainController',
			resolve: {
				songPromise: ['songs', function(songs) {
					return songs.getAll();
				}]
			}
		});

	$urlRouterProvider.otherwise('home');
}]);

jamApp.factory('socket', ['$rootScope', function($rootScope) {
	var socket = io.connect();
	var o = {};
	o.on = function (eventName, callback) {
    socket.on(eventName, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  };
  o.emit = function (eventName, data, callback) {
    socket.emit(eventName, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    });
  };
	return o;
}]);

jamApp.factory('songs', ['$http', 'socket', function($http, socket){
	var o = {
		songs: []
	};

	o.getAll = function() {
		return $http.get('/songs').success(function(data) {
			angular.copy(data, o.songs);
		});
	};

	o.create = function(song) {
		return $http.post('/songs', song).success(function(data) {
			o.songs.push(data);
		});
	};

	o.upvote = function(song) {
		socket.emit('send:upvote', {'sid': song.spotifyId} );
	};

	o.updateOne = function(sid, upvotes) {
		var i = o.songs.findIndex(function(song) {
			return song.spotifyId == sid;  // TODO: double or triple equals?
		});
		o.songs[i].upvotes = upvotes;
	};

	o.removeAll = function() {
		return $http.get('/reset').success(function(data) {
			console.log(data);
			o.getAll();
		});
	};

	return o;
}]);

jamApp.controller('MainController', [
'$scope',
'songs',
'socket',
function ($scope, songs, socket) {
	$scope.songs = songs.songs;

	$scope.addSong = function(){
		if(!$scope.sid || $scope.sid === '') { return; }

		songs.create({
			spotifyId: $scope.sid,
			upvotes: []
		});

		$scope.sid = '';
	};

	$scope.incrementUpvotes = function(song) {
		songs.upvote(song);
	};

	$scope.reset = function() {
		songs.removeAll();
	};

	socket.on('ack:upvote', function(data) {
		console.log('received ack:upvote event');
		// console.dir(data);
		songs.updateOne(data.spotifyId, data.upvotes);
	});

	socket.on('upvote', function(data) {
		console.log('received upvote event');
		// console.dir(data);
		songs.updateOne(data.spotifyId, data.upvotes);
	});

}]);
