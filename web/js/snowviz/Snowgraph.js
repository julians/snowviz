var snowviz = snowviz || {};

snowviz.Snowgraph = L.Class.extend({
	includes: L.Mixin.Events,
	options: {
		app: null,
		container: null,
		dataController: null
	},
	initialize: function (options)
	{
		L.Util.setOptions(this, options);
		
		this.options.container = $(this.options.container);
		this.stage = new Kinetic.Stage({
			container: this.options.container[0],
			width: this.options.container.width(),
			height: this.options.container.height()
		});
		this.graphLayer = new Kinetic.Layer();
		this.stage.add(this.graphLayer);
			  
		this.graphs = {};
		this.graphPoints = null;
		this.stepSize = 0;
		
		this.options.app.addEventListener("uiResize", this.redrawGraph.bind(this));
		this.options.dataController.addEventListener("timelineDataChanged", this.initWithData.bind(this));
	},
	initWithData: function ()
	{
		this.options.dataController.removeEventListener("timelineDataChanged", this.initWithData.bind(this));
		this.options.dataController.addEventListener("dateChanged", this.dateChanged.bind(this));
		this.dateChanged();
	},
	dateChanged: function ()
	{
		console.log("Snowgraph: dateChanged");
		this.calculateGraphPoints();
		this.redrawGraph();
	},
	getDataForPosition: function (x)
	{
		var data = this.options.dataController.getTimelineData();
		var stepSize = this.getStepSize();
		var offset = stepSize/2;
		var dayIndex = Math.floor((x+offset)/stepSize);
		return {
			"day": data["days"][dayIndex],
			"index": dayIndex
		}
	},
	getWidth: function ()
	{
		return this.options.container.width();
	},
	getHeight: function ()
	{
		return this.options.container.height();
	},
	getStepSize: function ()
	{
		var randomKey = _.chain(this.graphPoints).keys().first().value();
		// NOT length - 1 because we have one additional day shown
		// (the half-days at the left and right extremes of the graph)
		return this.stage.getWidth() / (this.graphPoints[randomKey].length);
	},
	calculateGraphPoints: function ()
	{
		console.log("Timeline: calculating graph points");
		var self = this;
		var data = self.options.dataController.getTimelineData();
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
		var data = self.options.dataController.getTimelineData();
		if (data && self.graphPoints) {
			console.log("Timeline: redrawing graphs");
			
			// alte Graphen löschen
			self.graphs = {};
			self.graphLayer.removeChildren();
			
			// figure out new size, if needed
			self.stage.setHeight(self.getHeight());
			self.stage.setWidth(self.getWidth());
			
			// figure out how many pixels apart we need to put each data point for the graph,
			// and the vertical scale
			var stepSize = this.getStepSize();
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
				// duplicate first point
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