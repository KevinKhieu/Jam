'use strict';

var jamApp = angular.module('jamApp', ['ngRoute', 'ngMaterial', 'ngResource']);

jamApp.controller('MainController', ['$scope', '$rootScope', '$location', '$http', '$routeParams', '$resource', '$mdDialog', '$mdMedia',
    function ($scope, $rootScope, $location, $http, $routeParams, $resource, $mdDialog, $mdMedia) {
        
    	$scope.main = {};
    	$scope.main.songName = "SHAPE OF YOU";
    	$scope.main.artist = "ED SHEERAN";
    	$scope.main.lastPlayedArtist = "The Chainsmokers";
    	$scope.main.lastPlayedTitle = "Paris"
    	$scope.main.playlist = [{name: "Yellow", artist: "Coldplay"}, 
    		{name: "Yellow", artist: "Coldplay"}, 
    		{name: "Yellow", artist: "Coldplay"}, 
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"},
    		{name: "Yellow", artist: "Coldplay"}];

        
}]);      

