$(document).ready(function ()
{
	paper.install(window);
	var canvas = document.getElementById('snowgraph');
	paper.setup(canvas);

	var graphs = {};
	
	var data = null;
	console.log("loading data…");
	$.getJSON('http://localhost:5000/graph?callback=?', function(response) {
		data = response;
		redrawGraph();
		console.log("yay");
	});
	
	$(window).resize(redrawGraph);

	function redrawGraph ()
	{
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
			console.log(altitudeStrings);
			
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