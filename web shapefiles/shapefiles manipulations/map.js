$(document).ready(function () {

	var shape1 = [
		[52.411281,13.049966],
		[52.414403,13.044934],
		[52.411746,13.044752]
	]
	
	var map = L.map('map', {
		center : [52.4125, 13.051],
		zoom : 17,
		//layers : [layer.basemap1, layer.geojson]
	});

	L.tileLayer('http://{s}.tile.cloudmade.com/99411e86ded640dd91f0a455b552ae36/997/256/{z}/{x}/{y}.png').addTo(map);

	//console.log(shape1);

	var polygon = L.polygon([shape1]).addTo(map);



});