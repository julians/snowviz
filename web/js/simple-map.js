$(document).ready(function () {

	var add1 = 1572/2*0.0050865689142654;
	var add2 = 151*0.0050865689142654;
	var bounds = new L.LatLngBounds([38.7, 67], [38.7+add2, 67+add1]);
	
	var map = L.map('map', {
        center: bounds.getCenter(),
        zoom : 10,
		attributionControl: false
    });

	L.tileLayer('http://localhost:8888/v2/Snowviz/{z}/{x}/{y}.png').addTo(map);
	
	var currentLayer = new L.layerGroup().addTo(map);
	var firstDate = moment("2012-01-01");
	var lastDate = moment("2012-01-01").add("days", 151);
	var currentDate = moment("2012-01-01");
	
    $(window).keypress(function (event) {
		console.log("keypress");
        if (event.charCode == 107) {
            previousDate();
        } else if (event.charCode == 106) {
            nextDate();
        }
    });
	
	var currentCoverageLayer = null;
	
	// getDataForCurrentDate();
	
	function getDataForCurrentDate()
	{
		console.log("getting data");
		$.getJSON('http://localhost:5000/date/'+currentDate.format("YYYY-MM-DD")+'?callback=?', function(data) {
			var cellsize = data["cellsize"];
			console.log("got some data");
			
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
			console.log("yay");
		});
	}
	function previousDate()
	{
		console.log("f1");
		if (currentDate > firstDate) currentDate.subtract("days", 1);
		console.log("previous date: " + currentDate.format("YYYY-MM-DD"));
		getDataForCurrentDate();
	}
	function nextDate()
	{
		console.log("f1");
		if (currentDate < lastDate) currentDate.add("days", 1);
		console.log("next date: " + currentDate.format("YYYY-MM-DD"));
		getDataForCurrentDate();
	}
});