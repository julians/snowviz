var snowviz = snowviz || {};

snowviz.Snowgraph = L.Class.extend({
	includes: L.Mixin.Events,
	options: {
		app: null,
		container: null,
		dataController: null,
		dateTextStyle: {
			fontSize: 10,
			fontFamily: "Helvetica Neue",
			fill: "#ccc",
			y: 10
		}
	},
	initialize: function (options)
	{
		L.Util.setOptions(this, options);
		
		this.options.container = $(this.options.container);
		this.stage = new Kinetic.Stage({
			container: this.options.container.children(".graph").first()[0],
			width: this.options.container.width(),
			height: this.options.container.height()
		});
		this.graphLayer = new Kinetic.Layer();
		this.stage.add(this.graphLayer);
		
		this.labelContainer = this.options.container.children(".labels").first();
		this.labelTemplate = this.labelContainer.children().first().clone();
		this.labelContainer.empty();
			  
		this.graphs = {};
		this.graphPoints = null;
		this.stepSize = 0;
		
		this.options.dataController.addEventListener("timelineDataChanged", this.initWithData.bind(this));
	},
	initWithData: function ()
	{
		this.options.app.addEventListener("uiResize", this.redrawGraph.bind(this));
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
		var data = this.options.dataController.getTimelineDataForSelectedRange();
		var stepSize = this.getStepSize();
		var index = Math.floor(x/stepSize);
		return data[index];
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
		return this.stage.getWidth() / (this.graphPoints[randomKey].length-2);
	},
	calculateGraphPoints: function ()
	{
		console.log("Timeline: calculating graph points");
		var self = this;
		var duplicateFirstDay = true;
		var duplicateLastDay = true;
		
		// figure out what the first date is
		// and if we have data for the date before
		var start = self.options.dataController.getFirstSelectedDateIndex();
		if (!self.options.dataController.isFirstDateSelected()) {
			start--;
			duplicateFirstDay = false;
		}
		
		// figure out what the last date is
		// and if we have data for the date before
		var end = self.options.dataController.getLastSelectedDateIndex();
		if (!self.options.dataController.isLastDateSelected()) {
			end++;
			duplicateLastDay = false;
		}
		
		// get the data
		var data = self.options.dataController.getTimelineDataForRange(start, end);
		self.graphPoints = {};
		var altitudeStrings = self.options.dataController.getAltitudeRanges();
		
		// summing up altitudes for the graphs to build on each other
		// prefill with 0
		var altitudeSums = [];
		for (var i = data.length - 1; i >= 0; i--){
			altitudeSums[i] = 0;
		}
		
		// calculate points for graph
		_.each(altitudeStrings, function (altitude, altitudeIndex) {
			self.graphPoints[altitude] = [];
			_.each(data, function (day, dayIndex) {
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
		// there’s no data for the date before the first selected,
		// so we’ll duplicate that
		if (duplicateFirstDay) {
			_.each(altitudeStrings, function (altitude, altitudeIndex) {
				self.graphPoints[altitude].unshift(self.graphPoints[altitude][0]);
			});
		}
		// there’s no data for the date after the last selected,
		// so we’ll duplicate that
		if (duplicateLastDay) {
			_.each(altitudeStrings, function (altitude, altitudeIndex) {
				self.graphPoints[altitude].push(self.graphPoints[altitude][self.graphPoints[altitude].lenght-1]);
			});
		}
	},
	redrawGraph: function ()
	{
		var self = this;
		if (self.graphPoints) {
			console.log("Timeline: redrawing graphs");
			
			// alte Graphen löschen
			self.graphs = {};
			self.graphLayer.removeChildren();
			
			// delete old labels
			self.labelContainer.empty();
			
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
			var altitudeStrings = self.options.dataController.getAltitudeRanges();
			
			_.each(altitudeStrings, function (altitude, altitudeIndex) {
				var points = [];
				_.each(self.graphPoints[altitude], function (graphPoint, graphPointsIndex) {
					points.push([
						stepSize/-2+stepSize*graphPointsIndex,
						h-h*graphPoint
					]);
				});
				// bottom right corner point
				points.push([
					stepSize/-2+stepSize*self.graphPoints[altitude].length,
					h
				]);
				// bottom left corner point
				points.push([
					stepSize/-2,
					h
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
			
			// date lines and text
			var dateData = self.options.dataController.getTimelineDataForSelectedRange();
			_.each(self.graphPoints[altitudeStrings[0]], function (graphPoint, index) {
				var line = new Kinetic.Line({
					points: [
						[stepSize/-2+stepSize*index, h],
						[stepSize/-2+stepSize*index, 0]
					],
					strokeWidth: 1,
					stroke: "#ccc"
				});
				if (index > 0 && index < self.graphPoints[altitudeStrings[0]].length-1) {
					var label = self.labelTemplate.clone();
					label.html(moment(dateData[index-1]["date"]).format("DD.MM.YYYY"));
					label.css("left", (stepSize/-2+stepSize*index+5) + "px");
					self.labelContainer.append(label);
				}
				self.graphLayer.add(line);
				line.moveToBottom();
			});
			
			// draw everything
			self.graphLayer.draw();
			this.fireEvent("timelineRedrawn");
		}
	}
});