'use strict';

/* Entry point for Angular app. */

var jamApp = angular.module('jamApp', ['controller', 'ui.router']);

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
