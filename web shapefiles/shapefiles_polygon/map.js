$(document).ready(function () {

	var shape1 = [
		[52.411281,13.049966],
		[52.414403,13.044934],
		[52.411746,13.044752]
	]


	var welt = [
		[-90,-90],
		[90,-90],
		[90,90],
		[-90,90]
	]
	
	var map = L.map('map', {
		center : [52.4125, 13.051],
		zoom : 17,
		//layers : [layer.basemap1, layer.geojson]
	});

	L.tileLayer('http://{s}.tile.cloudmade.com/99411e86ded640dd91f0a455b552ae36/997/256/{z}/{x}/{y}.png').addTo(map);

	var polygon = L.polygon([welt,shape1]).addTo(map);


	/*L.TileLayer.maskCanvas();

	var layer = L.TileLayer.maskCanvas({
       radius: 5,  // radius in pixels or in meters (see useAbsoluteRadius)
       useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
       color: '#000',  // the color of the layer
       opacity: 0.5,  // opacity of the not coverted area
	});
	
	layer.setData(shape1);

	map.addLayer(layer);*/



});