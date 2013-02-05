var snowviz = snowviz || {};

snowviz.Timeline = L.Class.extend({
	includes: L.Mixin.Events,
	stepSize: 0,
	initialize: function (options)
	{
		// set up graph
		paper.setup($('#snowgraph').get(0));
		view.onResize = this.redrawGraph.bind(this);
		this.graphs = {};
		
		if (options && options.dataController) {
			console.log("Timeline: registering dataController")
			this.dataController = options.dataController;
			this.dataController.addEventListener("timelineDataChanged", this.redrawGraph.bind(this));
		}
	},
	redrawGraph: function ()
	{
		var self = this;
		paper.projects[0].activate();
		var data = self.dataController.getTimelineData();
		if (data) {
			// alte Graphen löschen
			$.each(self.graphs, function (key, graph) {
				graph.remove();
			});
			self.graphs = {};
			
			// figure out how many pixels apart we need to put each data point for the graph,
			// and the vertical scale
			var stepSize = view.viewSize.width / (data["days"].length-1);
			self.stepSize = stepSize;
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
				self.graphs[altitude] = new Path();
				self.graphs[altitude].fillColor = new HSLColor(
					0,
					0,
					1-(1/(altitudeStrings.length-1)*altitudeIndex)
				);
				for (var i = altitudeSums.length - 1; i >= 0; i--) {
					self.graphs[altitude].add(new Point(i*stepSize, h-h*altitudeSums[i]));
				}
				
				// add data points graph
				_.each(data["days"], function (day, dayIndex) {					
					if (_.has(day, altitude)) {
						self.graphs[altitude].add(new Point(dayIndex*stepSize, h-h*(day[altitude]["relative_to_area"]+altitudeSums[dayIndex])));
						altitudeSums[dayIndex] += day[altitude]["relative_to_area"];
					} else {
						self.graphs[altitude].add(new Point(dayIndex*stepSize, h-h*altitudeSums[dayIndex]));
					}
				});
				self.graphs[altitude].closed = true;
			});
			
			view.draw();
		}
	}
});