var snowviz = snowviz || {};

snowviz.Timeline = L.Class.extend({
	includes: L.Mixin.Events,
	stepSize: 0,
	stage: null,
	container: null,
	initialize: function (options)
	{
		// set up graph
		this.container = $(options.container);
		this.stage = new Kinetic.Stage({
			container: this.container[0],
			width: this.container.width(),
			height: this.container.height()
		});
		this.graphLayer = new Kinetic.Layer();
		this.stage.add(this.graphLayer);
			  
		this.graph = null;
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
		this.redrawGraph();
	},
	getDataForPosition: function (x)
	{
		var data = this.dataController.getTimelineData();
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
		return this.container.width();
	},
	getHeight: function ()
	{
		return this.container.height();
	},
	getStepSize: function ()
	{
		// NOT length - 1 because we have one additional day shown
		// (the half-days at the left and right extremes of the graph)
		var data = this.dataController.getTimelineData();
		return this.stage.getWidth() / data["days"].length;
	},
	redrawGraph: function ()
	{
		var self = this;
		var data = self.dataController.getTimelineData();
		if (data) {
			console.log("Timeline: redrawing graphs");
			
			// alte Graphen löschen
			self.graph = null;
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
			
			var points = [];
			
			_.each(data["days"], function (day, dayIndex) {
				if (_.has(day, "total")) {
					points.push([
						stepSize/2+stepSize*dayIndex,
						h-h*day["total"]["relative_to_area"]
					]);
				} else {
					points.push([
						stepSize/2+stepSize*dayIndex,
						h
					]);
				}
			});
			
			// duplicate last point
			points.push([
				stepSize/2+stepSize*points.length,
				h-h*_.last(points)
			]);
			// bottom right corner point
			points.push([
				stepSize/2+stepSize*points.length,
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
				h-h*_.first(points)
			]);
			
			console.dir(points);
			
			self.graph = new Kinetic.Polygon({
				points: points,
				fill: "hsl(202, 67%, 50%)"
				//fill: "red"
			});
			self.graphLayer.add(self.graph);

			// draw everything
			self.graphLayer.draw();
			this.fireEvent("timelineRedrawn");
		}
	}
});