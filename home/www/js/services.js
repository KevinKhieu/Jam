'use strict';

angular.module('songServices', [])
.factory('songs', ['$http', 'socket', function($http, socket) {
	var o = {
		songs: []  // unsorted -- the html does the sorting
	};

	o.getAll = function() {
		return $http.get('/songs').then(function(res) {
			angular.copy(res.data, o.songs);
		});
	};

	o.add = function(song) {
		return $http.post('/songs', song).then(function(res) {
			o.songs.push(res.data);
			console.log("successfully posted to /songs and pushed data onto local songs object.");
		});
	};

	o.setUpvotes = function(sid, upvotes) {
		var i = o.songs.findIndex(function(song) {
			return song.spotifyId === sid;
		});
		o.songs[i].upvotes = upvotes;
		console.log(sid + ' has ' + upvotes.length + ' upvotes.');
	};

	o.removeAll = function() {
		return $http.get('/reset').then(function(res) {
			console.log(res.data);
			o.getAll();
		});
	};

	return o;
}])


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

.factory('socket', ['$rootScope', function($rootScope) {
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
