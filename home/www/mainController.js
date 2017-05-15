'use strict';

var jamApp = angular.module('jamApp', ['ngRoute', 'ngMaterial', 'ngResource']);

$(document).ready(function() {
  // initialization
    SC.initialize({
        client_id: "02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea"
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
  //   });

    SC.stream('/tracks/293').then(function(player){
      player.play();
    });

    // API Key: last.fm
    // 254aca4d820bd8096466bcdc76783feb

    // secret:
    // b5a931498797ae2080f21bac4599842d
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

