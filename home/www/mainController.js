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

