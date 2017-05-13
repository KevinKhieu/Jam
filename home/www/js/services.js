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
		o.songs.push(song);
		console.log("successfully sent add-song and pushed data onto local songs object.");
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
}])

.factory('socket-controller', ['socket', 'songs', function(socket, songs) {
	/* The part of the controller that responds to socket events. Don't know better
	 * place to register with socket.on - can't do it in the controller because
	 * it gets called twice there. */

	socket.on('push:add-song', function(data) {
		songs.add(data);
	});

	socket.on('push:upvote', function(data) {
		console.log('received push:upvote event for ' + data.spotifyId);
		// console.dir(data);
		songs.setUpvotes(data.spotifyId, data.upvotes);
	});

	socket.on('push:queue', function(data) {
		console.log('received push:queue event');
		angular.copy(data, songs.songs);
	});

	return {};
}]);
