$(document).ready(function ()
{
	// map
	var add1 = 1572/2*0.0050865689142654;
	var add2 = 151*0.0050865689142654;
	var bounds = new L.LatLngBounds([38.7, 67], [38.7+add2, 67+add1]);
	
	var map = L.map('map', {
        center: bounds.getCenter(),
        zoom : 10,
		attributionControl: false
    });

	L.tileLayer('http://localhost:8888/v2/Snowviz_cd4e28/{z}/{x}/{y}.png').addTo(map);
	
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
	
	getDataForCurrentDate();
	
	function getDataForCurrentDate()
	{
		console.log("getting data");
		$.getJSON('http://localhost:5000/date/'+currentDate.format("YYYY-MM-DD")+'?callback=?', function(data) {
			var cellsize = data["cellsize"];
			console.log("got some data");
			
			var newCoverageLayer = new L.TileLayer.SnowCoverage({
				'opacity': 1,
				"rectSize": data["cellsize"]
			});
			
			newCoverageLayer.setData(data["points"]);
			if (currentCoverageLayer != null) map.removeLayer(currentCoverageLayer);
			currentCoverageLayer = newCoverageLayer;
			map.addLayer(newCoverageLayer);
			console.log("yay");
		});
	}
	function goToDate(dateString)
	{
		var newDate = moment(dateString);
		if (newDate != currentDate && newDate >= firstDate && newDate <= lastDate) {
			currentDate = newDate;
			getDataForCurrentDate();
		}
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
	
	// timeline
	paper.install(window);
	
	// set up graph
	paper.setup($('#snowgraph').get(0));

	view.onResize = function (event) {
		redrawGraph();
	};
	var graphs = {};
	var data = null;
	console.log("loading graph data…");
	$.getJSON('http://localhost:5000/graph?callback=?', function(response) {
		data = response;
		redrawGraph();
		console.log("graph data loaded");
	});
	
	// set up interactions for graph
	paper.setup($('#snowgraph_interaction').get(0));
	paper.projects[1].activate();
	var hover_highlight = new Path();
	var hover_highlight_style = {
		fillColor: new HSLColor(0, 1, 0.5, 0.5)
	};
	var hover_text = new PointText(new Point(0, 0));
	hover_text.fillColor = "red";
	hover_text.content = "date";
	var hover_pointer = new Tool();
	hover_pointer.onMouseMove = function (event) {
		paper.projects[1].activate();
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && data) {
			var dayData = getGraphDataForPosition(event.point.x);
			var stepSize = view.viewSize.width / (data["days"].length-1);
			hover_highlight.removeSegments();
			hover_highlight = new Path.Rectangle(new Rectangle(dayData["index"]*stepSize, 0, stepSize, view.viewSize.height));
			hover_highlight.style = hover_highlight_style;
			hover_highlight.visible = true;
			hover_text.visible = true;
			hover_text.content = dayData["day"]["date"];
			positionHoverText(hover_text, dayData["index"], stepSize);
		} else {
			hover_highlight.visible = false;
			hover_text.visible = false;
		}
	}
	hover_pointer.onMouseUp = function (event) {
		paper.projects[1].activate();
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && data) {
			var dayData = getGraphDataForPosition(event.point.x);
			goToDate(dayData["day"]["date"])
		}
	}
	
	function getGraphDataForPosition (x)
	{
		var stepSize = view.viewSize.width / (data["days"].length-1);
		var dayIndex = Math.floor(x/stepSize);
		return {
			"day": data["days"][dayIndex],
			"index": dayIndex
		}
	}
	
	function positionHoverText (text, index, stepSize)
	{
		var b = text.bounds;
		var hPadding = 5;
		var vPadding = 15;
		if (index*stepSize + b.width + hPadding*2 > view.viewSize.width) {
			text.paragraphStyle.justification = "right";
			text.setPoint(new Point(index*stepSize-hPadding, vPadding));
		} else {
			text.paragraphStyle.justification = "left";
			text.setPoint(new Point(index*stepSize+stepSize+hPadding, vPadding));
		}
	}

	function redrawGraph ()
	{
		paper.projects[0].activate();
		if (data) {
			// alte Graphen löschen
			$.each(graphs, function (key, graph) {
				graph.remove();
			});
			graphs = {};
			
			// figure out how many pixels apart we need to put each data point for the graph,
			// and the vertical scale
			var stepSize = view.viewSize.width / (data["days"].length-1);
			var yScale = view.viewSize.height;
			// coordinate system starts top left, so we want to subtract the item values from the height
			var h = view.viewSize.height;
			
			// Höhenstufen umsortieren und in Strings umwandeln
			var altitudeStrings = _.map(data["altitude_ranges"], function (altitude) {
				return altitude+"";
			});
			
			// summing up altitudes for the graphs to build on each other
			// prefill with 0
			var altitudeSums = [];
			for (var i = data["days"].length - 1; i >= 0; i--){
				altitudeSums[i] = 0;
			}
			
			// Pfade anlegen
			_.each(altitudeStrings, function (altitude, altitudeIndex) {
				graphs[altitude] = new Path();
				graphs[altitude].fillColor = new HSLColor(
					0,
					0,
					1-(1/(altitudeStrings.length-1)*altitudeIndex)
				);
				for (var i = altitudeSums.length - 1; i >= 0; i--) {
					graphs[altitude].add(new Point(i*stepSize, h-h*altitudeSums[i]));
				}
				
				// add data points graph
				_.each(data["days"], function (day, dayIndex) {					
					if (_.has(day, altitude)) {
						graphs[altitude].add(new Point(dayIndex*stepSize, h-h*(day[altitude]["relative_to_area"]+altitudeSums[dayIndex])));
						altitudeSums[dayIndex] += day[altitude]["relative_to_area"];
					} else {
						graphs[altitude].add(new Point(dayIndex*stepSize, h-h*altitudeSums[dayIndex]));
					}
				});
				graphs[altitude].closed = true;
			});
			
			view.draw();
		}
	}
});