var snowviz = snowviz || {};

/*
	setting up the classes
*/

snowviz.MapView = L.Class.extend({
	includes: L.Mixin.Events,
	map: null,
	options: {
		tileLayerURL: 'http://localhost:8888/v2/Snowviz_cd4e28/{z}/{x}/{y}.png',
		initialMapBounds: [[38.7, 67], [39.4680719060540754, 70.99804316661260440000]]
	},
	snowLayer: null,
	dataController: null,
	initialize: function (options)
	{
		var bounds = new L.LatLngBounds(this.options.initialMapBounds);
		this.map = L.map('map', {
			center: bounds.getCenter(),
		    zoom : 10,
			attributionControl: false
		});
		L.tileLayer(this.options.tileLayerURL).addTo(this.map);
		if (options && options.dataController) {
			console.log("MapView: registering dataController")
			this.dataController = options.dataController;
			this.dataController.addEventListener("snowDataChanged", this.updateSnowLayer.bind(this));
		}
	},
	updateSnowLayer: function ()
	{
		console.log("MapView: updating snow layer");
		
		var data = this.dataController.getMapSnowData();
		
		var newSnowLayer = new L.TileLayer.SnowCoverage({
			'opacity': 1,
			"rectSize": data.cellsize
		});
		
		newSnowLayer.setData(data.points);
		if (this.snowLayer != null) this.map.removeLayer(this.snowLayer);
		this.snowLayer = newSnowLayer;
		this.map.addLayer(this.snowLayer);
		
		console.log("MapView: done updating snow layer");
	}
});

snowviz.DataController = L.Class.extend({
	includes: L.Mixin.Events,
	firstDate: null,
	lastDate: null,
	currentDate: null,
	graphData: null,
	mapSnowData: null,
	initialize: function ()
	{
		this.firstDate = moment("2012-01-01");
		this.lastDate = moment("2012-01-01").add("days", 151);
		this.currentDate = moment("2012-01-01");
	},
	initData: function ()
	{
		this.loadDataForCurrentDate();
		this.loadDataForGraph();
	},
	loadDataForGraph: function()
	{
		console.log("DataController: loading graph data");
		var self = this;
		$.getJSON('http://localhost:5000/graph?callback=?', function(response) {
			self.graphData = response;
			self.fireEvent("graphDataChanged");
		});
	},
	loadDataForCurrentDate: function()
	{
		console.log("DataController: loading data for current date");
		var self = this;
		$.getJSON('http://localhost:5000/date/'+this.currentDate.format("YYYY-MM-DD")+'?callback=?', function(data) {
			//var cellsize = data["cellsize"];
			console.log("DataController: got some data");
			self.mapSnowData = data;
			self.fireEvent("snowDataChanged", {
				date: data.date
			});
		});
	},
	getMapSnowData: function ()
	{
		return this.mapSnowData;
	},
	getGraphData: function ()
	{
		return this.graphData;
	},
	setCurrentDate: function (newDate)
	{
		console.log("DataController: setCurrentDate");
		if (newDate != this.currentDate && newDate >= this.firstDate && newDate <= this.lastDate) {
			console.log("DataController: date changed");
			this.currentDate = moment(newDate);
			this.fireEvent("dateChanged");
			this.loadDataForCurrentDate();
			return true;
		} else {
			return false;
		}
	},
	goToDate: function (newDate)
	{
		var newDate = moment(newDate);
		this.setCurrentDate(newDate);
	},
	goToNextDate: function ()
	{
		console.log("DataController: goToNextDate");
		var nextDate = moment(this.currentDate).add("days", 1);
		return this.setCurrentDate(nextDate);
	},
	goToPreviousDate: function ()
	{
		console.log("DataController: goToPreviousDate");
		var previousDate = moment(this.currentDate).subtract("days", 1);
		return this.setCurrentDate(previousDate);
	}
});

snowviz.KeyboardController = L.Class.extend({
	includes: L.Mixin.Events,
	initialize: function (options)
	{
		if (options && options.dataController) {
			console.log("KeyboardController: registering dataController")
			this.dataController = options.dataController;
		}
		
		$(window).keypress(this.onKeyPress.bind(this));
	},
	onKeyPress: function (event)
	{
		console.log("KeyboardController: key pressed");
        if (event.charCode == 106) {
            this.dataController.goToPreviousDate();
        } else if (event.charCode == 107) {
            this.dataController.goToNextDate();
        }
	}
});

snowviz.Graph = L.Class.extend({
	includes: L.Mixin.Events,
	initialize: function (options)
	{
		// set up graph
		paper.setup($('#snowgraph').get(0));
		view.onResize = this.redrawGraph;
		this.graphs = {};
		
		if (options && options.dataController) {
			console.log("Graph: registering dataController")
			this.dataController = options.dataController;
			this.dataController.addEventListener("graphDataChanged", this.redrawGraph.bind(this));
		}
	},
	redrawGraph: function ()
	{
		var self = this;
		paper.projects[0].activate();
		var data = self.dataController.getGraphData();
		if (data) {
			// alte Graphen löschen
			$.each(self.graphs, function (key, graph) {
				self.graph.remove();
			});
			self.graphs = {};
			
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
snowviz.GraphInteraction = L.Class.extend({
	hoverHighlight: null,
	hoverHighlightStyle: null,
	hoverHighlightText: null,
	hoverPointer: null,
	dataController: null,
	initialize: function (options)
	{
		// set up interactions for graph
		paper.setup($('#snowgraph_interaction').get(0));
		paper.projects[1].activate();
		
		this.hoverHighlight = new Path();
		this.hoverHighlightStyle = {
			fillColor: new HSLColor(0, 1, 0.5, 0.5)
		};
		
		this.hoverHighlightText = new PointText(new Point(0, 0));
		this.hoverHighlightText.fillColor = "red";
		this.hoverHighlightText.content = "date";
		
		this.hoverpointer = new Tool();
		this.hoverpointer.onMouseMove = this.drawHoverPointer.bind(this);
		this.hoverpointer.onMouseUp = this.hoverPointerClicked.bind(this);
		
		if (options && options.dataController) {
			console.log("GraphInteraction: registering dataController")
			this.dataController = options.dataController;
		}
	},
	hoverPointerClicked: function (event)
	{
		paper.projects[1].activate();
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && this.dataController.getGraphData()) {
			var dayData = this.getGraphDataForPosition(this.dataController.getGraphData(), event.point.x);
			this.dataController.goToDate(dayData["day"]["date"]);
		}
	},
	drawHoverPointer: function (event)
	{
		paper.projects[1].activate();
		var data = this.dataController.graphData;
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && data) {
			var dayData = this.getGraphDataForPosition(data, event.point.x);
			var stepSize = view.viewSize.width / (data["days"].length-1);
			this.hoverHighlight.removeSegments();
			this.hoverHighlight = new Path.Rectangle(new Rectangle(dayData["index"]*stepSize, 0, stepSize, view.viewSize.height));
			this.hoverHighlight.style = this.hoverHighlightStyle;
			this.hoverHighlight.visible = true;
			this.hoverHighlightText.visible = true;
			this.hoverHighlightText.content = dayData["day"]["date"];
			this.positionHoverText(this.hoverHighlightText, dayData["index"], stepSize);
		} else {
			this.hoverHighlight.visible = false;
			this.hoverHighlightText.visible = false;
		}
	},
	getGraphDataForPosition: function (data, x)
	{
		var stepSize = view.viewSize.width / (data["days"].length-1);
		var dayIndex = Math.floor(x/stepSize);
		return {
			"day": data["days"][dayIndex],
			"index": dayIndex
		}
	},
	positionHoverText: function (text, index, stepSize)
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
})

snowviz.App = L.Class.extend({
	dataController: null,
	keyboardController: null,
	mapView: null,
	graph: null,
	initialize: function ()
	{
		this.dataController = new snowviz.DataController();
		this.keyboardController = new snowviz.KeyboardController({
			dataController: this.dataController
		});
		this.mapView = new snowviz.MapView({
			dataController: this.dataController
		});
		paper.install(window);
		this.graph = new snowviz.Graph({
			dataController: this.dataController
		});
		this.graphInteraction = new snowviz.GraphInteraction({
			dataController: this.dataController
		});
		this.dataController.initData();
	}
});

$(document).ready(function ()
{
	snowviz.app = new snowviz.App();
});