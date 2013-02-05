var snowviz = snowviz || {};

snowviz.TimelineRangePicker = L.Class.extend({
	includes: L.Mixin.Events,
	timeline: null,
	dataController: null,
	picker: null,
	initialize: function (options)
	{
		var self = this;
		this.timeline = options.timeline;
		this.dataController = options.dataController;
		this.picker = $("#rangepickerPicker");
		this.picker.resizable({
			containment: "parent",
			handles: "e, w",
			resize: this.duringResize.bind(this),
			stop: this.afterResize.bind(this)
		});
		this.picker.draggable({
			axis: "x",
			containment: "parent",
			drag: this.duringDrag.bind(this),
			stop: this.afterDrag.bind(this)
		});
		this.updatePickers();
		this.dataController.addEventListener("timelineDataChanged", this.updatePickers.bind(this));
	},
	duringResize: function (event, ui)
	{
		console.log("picker resize");
	},
	afterResize: function (event, ui)
	{
		console.log("picker resize stop");
		this.afterInteraction(event, ui);
	},
	duringDrag: function (event, ui)
	{
		console.log("picker drag");
	},
	afterDrag: function (event, ui)
	{
		console.log("picker drag stop");
		this.afterInteraction(event, ui);
	},
	afterInteraction: function (event, ui)
	{
		console.log("picker after interaction");
		var startdate = this.getTimelineDataForPosition(ui.position.left);
		var enddate = this.getTimelineDataForPosition(ui.position.left+this.picker.width());
		console.log(startdate["day"]["date"]);
		console.log(enddate["day"]["date"]);
		
		this.dataController.setDateAndRange(startdate["day"]["date"], enddate["index"]-startdate["index"]);
		
	},
	getTimelineDataForPosition: function (x)
	{
		var data = this.dataController.getTimelineData();
		var stepSize = view.viewSize.width / (data["days"].length-1);
		var dayIndex = Math.floor(x/stepSize);
		return {
			"day": data["days"][dayIndex],
			"index": dayIndex
		}
	},
	updatePickers: function ()
	{
		if (this.dataController.getTimelineData()) {
			console.log(this.timeline.stepSize);
			if (this.picker.width() == 0) this.picker.width(this.timeline.stepSize+"px");
			this.picker.draggable("enable");
			this.picker.draggable("option", "grid", [this.timeline.stepSize, 0]);
			this.picker.resizable("enable");
			this.picker.resizable("option", "grid", [this.timeline.stepSize, 0]);
			this.picker.show();
		} else {
			this.picker.draggable("disable");
			this.picker.resizable("disable");
			this.picker.hide();
		}
	}
});