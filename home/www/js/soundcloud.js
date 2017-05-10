'use strict';

/* Soundcloud API initialization. */

$(document).ready(function() {
	// initialization
	SC.initialize({
		client_id: "15c5a12b5d640af73b16bd240753ffbb"
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

	// SC.get('/tracks', {
	// 	q: 'Boyce Avenue',
	// 	license: 'cc-by-sa'
	// 	}, function(tracks) {
	// 		console.log(tracks);
	// 	});

	SC.stream('/tracks/293').then(function(player){
		player.play();
	});
});
