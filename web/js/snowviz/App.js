var snowviz = snowviz || {};

snowviz.App = L.Class.extend({
	includes: L.Mixin.Events,
	dataController: null,
	keyboardController: null,
	mapView: null,
	graph: null,
	shapefileManager: null,
	initialize: function ()
	{
		$(window).resize(this.resized.bind(this));
		
		this.dataController = new snowviz.DataController();
		/*
		this.keyboardController = new snowviz.KeyboardController({
			dataController: this.dataController
		});
		*/
		this.mapView = new snowviz.MapView({
			dataController: this.dataController
		});
		this.timeline = new snowviz.Timeline({
			dataController: this.dataController,
			app: this,
			container: $("#rangepickerGraph")
		});
		/*
		this.timelineInteraction = new snowviz.TimelineInteraction({
			dataController: this.dataController
		});
		*/
		this.timelineRangePicker = new snowviz.TimelineRangePicker({
			timeline: this.timeline,
			dataController: this.dataController,
			app: this
		});
		this.timelineZoomSelector = new snowviz.TimelineZoomSelector({
			dataController: this.dataController,
			app: this
		});
		this.timelineTextualDateDisplay = new snowviz.TimelineTextualDateDisplay({
			dataController: this.dataController,
			app: this
		});
		this.dataController.initData();
		this.shapefileManager = new snowviz.ShapefileManager({
			mapView: this.mapView,
			app: this
		});
	},
	resized: function (event)
	{
		if (event.target && event.target == window) {
			this.fireEvent("uiResize");
		}
	}
});