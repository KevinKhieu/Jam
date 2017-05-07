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
				// song.upvotes += 1;
				console.log("TODO: respond to upvote");
			});
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
function ($scope, songs) {
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
}]);
