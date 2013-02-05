var snowviz = snowviz || {};

snowviz.App = L.Class.extend({
	dataController: null,
	keyboardController: null,
	mapView: null,
	graph: null,
	shapefileManager: null,
	initialize: function ()
	{
		this.dataController = new snowviz.DataController();
		/*
		this.keyboardController = new snowviz.KeyboardController({
			dataController: this.dataController
		});
		*/
		this.mapView = new snowviz.MapView({
			dataController: this.dataController
		});
		paper.install(window);
		this.timeline = new snowviz.Timeline({
			dataController: this.dataController
		});
		/*
		this.timelineInteraction = new snowviz.TimelineInteraction({
			dataController: this.dataController
		});
		*/
		this.timelineRangePicker = new snowviz.TimelineRangePicker({
			timeline: this.timeline,
			dataController: this.dataController
		});
		this.timelineZoomSelector = new snowviz.TimelineZoomSelector({
			dataController: this.dataController
		});
		this.timelineTextualDateDisplay = new snowviz.TimelineTextualDateDisplay({
			dataController: this.dataController
		});
		this.dataController.initData();
		this.shapefileManager = new snowviz.ShapefileManager();
	}
});