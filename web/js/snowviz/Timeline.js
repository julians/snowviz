var snowviz = snowviz || {};

snowviz.Timeline = L.Class.extend({
	includes: L.Mixin.Events,
	stepSize: 0,
	stage: null,
	initialize: function (options)
	{
		// set up graph
		this.stage = new Kinetic.Stage({
			container: 'snowgraph',
			width: $("#snowgraph").width(),
			height: $("#snowgraph").height()
		});
		this.graphLayer = new Kinetic.Layer();
		this.stage.add(this.graphLayer);
			  
		this.graphs = {};
		this.graphPoints = null;
		this.stepSize = 0;
		
		this.app = options.app;
		
		if (options && options.dataController) {
			console.log("Timeline: registering dataController")
			this.dataController = options.dataController;
			this.dataController.addEventListener("timelineDataChanged", this.timelineDataChanged.bind(this));
		}
		this.app.addEventListener("uiResize", this.redrawGraph.bind(this));
	},
	timelineDataChanged: function ()
	{
		console.log("Timeline: timelineDataChanged");
		this.calculateGraphPoints();
		this.redrawGraph();
	},
	getWidth: function ()
	{
		return $("#snowgraph").width();
	},
	getHeight: function ()
	{
		return $("#snowgraph").height();
	},
	calculateGraphPoints: function ()
	{
		console.log("Timeline: calculating graph points");
		var self = this;
		var data = self.dataController.getTimelineData();
		self.graphPoints = {};
		var altitudeStrings = _.map(data["altitude_ranges"], function (altitude) {
			return altitude+"";
		});
		
		// summing up altitudes for the graphs to build on each other
		// prefill with 0
		var altitudeSums = [];
		for (var i = data["days"].length - 1; i >= 0; i--){
			altitudeSums[i] = 0;
		}
		
		// calculate points for graph
		_.each(altitudeStrings, function (altitude, altitudeIndex) {
			self.graphPoints[altitude] = [];
			_.each(data["days"], function (day, dayIndex) {
				if (_.has(day, altitude)) {
					self.graphPoints[altitude].push(
						day[altitude]["relative_to_area"]+altitudeSums[dayIndex]
					);
					altitudeSums[dayIndex] += day[altitude]["relative_to_area"];
				} else {
					self.graphPoints[altitude].push(
						altitudeSums[dayIndex]
					);
				}
			});
		});
	},
	redrawGraph: function ()
	{
		var self = this;
		var data = self.dataController.getTimelineData();
		if (data && self.graphPoints) {
			console.log("Timeline: redrawing graphs");
			
			// alte Graphen löschen
			self.graphs = {};
			self.graphLayer.removeChildren();
			
			// figure out new size, if needed
			self.stage.setHeight($("#snowgraph").height());
			self.stage.setWidth($("#snowgraph").width());
			
			// figure out how many pixels apart we need to put each data point for the graph,
			// and the vertical scale
			var stepSize = this.stage.getWidth() / (data["days"].length-1);
			self.stepSize = stepSize;
			var yScale = this.stage.getHeight();
			// coordinate system starts top left, so we want to subtract the item values from the height
			var h = this.stage.getHeight();
			
			// Höhenstufen umsortieren und in Strings umwandeln
			var altitudeStrings = _.map(data["altitude_ranges"], function (altitude) {
				return altitude+"";
			});
			console.log(altitudeStrings);
			
			_.each(altitudeStrings, function (altitude, altitudeIndex) {
				var points = [];
				_.each(self.graphPoints[altitude], function (graphPoint, graphPointsIndex) {
					points.push([
						stepSize/2+stepSize*graphPointsIndex,
						h-h*graphPoint
					]);
				});
				// duplicate last point
				points.push([
					stepSize/2+stepSize*self.graphPoints[altitude].length,
					h-h*_.last(self.graphPoints[altitude])
				]);
				// bottom right corner point
				points.push([
					stepSize/2+stepSize*self.graphPoints[altitude].length,
					h
				]);
				// bottom left corner point
				points.push([
					stepSize/-2,
					h
				]);
				// duplicate last point
				points.push([
					stepSize/-2,
					h-h*_.first(self.graphPoints[altitude])
				]);
				
				self.graphs[altitude] = new Kinetic.Polygon({
					points: points,
					fill: "hsl(202, 67%, "+ Math.floor(25+(75/(altitudeStrings.length-1)*altitudeIndex))+"%)"
				});
				self.graphLayer.add(self.graphs[altitude]);
				// have to move that layer to the bottom of the stack,
				// else you wouldn’t see the smaller ones, would you?
				self.graphs[altitude].moveToBottom();
			});
			// draw everything
			self.graphLayer.draw();
			this.fireEvent("timelineRedrawn");
		}
	}
});