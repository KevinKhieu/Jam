angular.module('songServices', [])
.factory('songs', ['$http', function($http) {
	var o = {
		songs: []
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

	o.removeAll = function() {
		return $http.get('/reset').then(function(res) {
			console.log(res.data);
			o.getAll();
		});
	};

	return o;
}]);
