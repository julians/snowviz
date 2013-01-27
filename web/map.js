$(document).ready(function () {

	var add1 = 1572/2*0.0050865689142654;
	var add2 = 151*0.0050865689142654;
	var bounds = new L.LatLngBounds([38.7, 67], [38.7+add2, 67+add1]);
	
	var map = L.map('map', {
        center: bounds.getCenter(),
        zoom : 10
    });

	L.tileLayer('http://localhost:8888/v2/Snowviz_cd4e28/{z}/{x}/{y}.png').addTo(map);
	
	var currentLayer = new L.layerGroup().addTo(map);
	var firstDate = moment("2012-01-01");
	var lastDate = moment("2012-01-01").add("days", 151);
	var currentDate = moment("2012-01-01");
	//var currentDate = moment("2012-01-01").add("days", 7*15);
	
    $(window).keypress(function (event) {
		console.log("keypress");
        if (event.charCode == 107) {
            previousDate();
        } else if (event.charCode == 106) {
            nextDate();
        }
    });
	
	var currentCoverageLayer = null;
	
	getDataForCurrentDate();
	
	function getDataForCurrentDate()
	{
		console.log("getting data");
		$.getJSON('http://localhost:5000/date/'+currentDate.format("YYYY-MM-DD")+'?callback=?', function(data) {
			var cellsize = data["cellsize"];
			console.log("got some data");
			//var newLayer = new L.layerGroup();
			// currentLayer.clearLayers();
			
			var newCoverageLayer = new L.TileLayer.MaskCanvas({
				'opacity': 0.5,
				radius: 750,
				useAbsoluteRadius: true
			});
			
			newCoverageLayer.options.rectSize = data["cellsize"];
			newCoverageLayer.setData(data["points"]);
			if (currentCoverageLayer != null) map.removeLayer(currentCoverageLayer);
			currentCoverageLayer = newCoverageLayer;
			map.addLayer(newCoverageLayer);
			/*
			for (var i = data["points"].length - 1; i >= 0; i--){
				var bounds = [
					[data["points"][i][0],
					data["points"][i][1]],
					[data["points"][i][0]+cellsize,
					data["points"][i][1]+cellsize]
				];
				L.rectangle(bounds, {stroke: false, fillColor: "#fff", fillOpacity: 0.5}).addTo(currentLayer);
			};
			*/
			//if (currentLayer) map.removeLayer(currentLayer);
			//
			//currentLayer = newLayer;
			//map.addLayer(currentLayer);
			console.log("yay");
		});
	}
	function previousDate()
	{
		console.log("f1");
		if (currentDate > firstDate) currentDate.subtract("days", 1);
		console.log("previous date: " + currentDate.format("YYYY-MM-DD"));
		// map.removeLayer(currentLayer);
		// console.log("cleared layers");
		getDataForCurrentDate();
	}
	function nextDate()
	{
		console.log("f1");
		if (currentDate < lastDate) currentDate.add("days", 1);
		console.log("next date: " + currentDate.format("YYYY-MM-DD"));
		// map.removeLayer(currentLayer);
		// console.log("cleared layers");
		getDataForCurrentDate();
	}
});