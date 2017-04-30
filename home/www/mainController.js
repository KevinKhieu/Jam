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

jamApp.factory('songs', ['$http', function($http){
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
		return $http.post('/upvote', {'sid': song.spotifyId} )
			.success(function(data) {
				song.upvotes += 1;
			});
	};

	return o;
}]);

jamApp.controller('MainController', [
'$scope',
'songs',
function ($scope, songs) {
	$scope.songs = songs.songs;

	$scope.addSong = function(){
		if(!$scope.sid || $scope.sid === '') { return; }

		songs.create({
			spotifyId: $scope.sid,
			upvotes: 0
		});

		$scope.sid = '';
	};

	$scope.incrementUpvotes = function(song) {
		songs.upvote(song);
	};
}]);
