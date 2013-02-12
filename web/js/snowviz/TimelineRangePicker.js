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
		this.dataController.addEventListener("dateChanged", this.redrawPickers.bind(this));
		this.timeline.addEventListener("timelineRedrawn", this.redrawPickers.bind(this));
	},
	redrawPickers: function ()
	{	
		var data = this.dataController.getTimelineData();
		if (data) {
			console.log("redrawing pickers");
			var startdate = this.dataController.currentDate;
			var startdateIndex = this.dataController.getCurrentDateOffset();
			var range = this.dataController.currentRange;
			
			var stepSize = this.timeline.getStepSize();
		
			this.picker.css({
				"left": (stepSize*startdateIndex)+"px",
				"width": (stepSize*(range+1))+"px"
			});
		}
	},
	duringResize: function (event, ui)
	{
		console.log("picker resize");
	},
	afterResize: function (event, ui)
	{
		console.log("picker resize stop");
		var offset = this.timeline.getStepSize()/2;
		var startdate = this.timeline.getDataForPosition(ui.position.left);
		// we need the offset because of… ROUNDING? I don’t actually know
		// TODO: investigate why we need the offset here
		var enddate = this.timeline.getDataForPosition(ui.position.left+this.picker.width()-offset);
		
		this.dataController.setDateAndRange(startdate["day"]["date"], enddate["index"]-startdate["index"]);
	},
	duringDrag: function (event, ui)
	{
		console.log("picker drag");
	},
	afterDrag: function (event, ui)
	{
		console.log("picker drag stop");
		var startdate = this.timeline.getDataForPosition(ui.position.left);
		
		// never change the range when only dragging
		this.dataController.setDateAndRange(startdate["day"]["date"], this.dataController.currentRange);
	},
	updatePickers: function ()
	{
		if (this.dataController.getTimelineData()) {
			var stepSize = this.timeline.getStepSize();
			if (this.picker.width() == 0) this.picker.width(stepSize+"px");
			this.picker.draggable("enable");
			this.picker.draggable("option", "grid", [stepSize, 0]);
			this.picker.resizable("enable");
			this.picker.resizable("option", "grid", [stepSize, 0]);
			this.picker.show();
			this.redrawPickers();
		} else {
			this.picker.draggable("disable");
			this.picker.resizable("disable");
			this.picker.hide();
		}
	}
});