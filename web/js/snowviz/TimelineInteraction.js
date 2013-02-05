var snowviz = snowviz || {};

snowviz.TimelineInteraction = L.Class.extend({
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
			console.log("TimelineInteraction: registering dataController")
			this.dataController = options.dataController;
		}
	},
	hoverPointerClicked: function (event)
	{
		paper.projects[1].activate();
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && this.dataController.getTimelineData()) {
			var dayData = this.getTimelineDataForPosition(this.dataController.getTimelineData(), event.point.x);
			this.dataController.goToDate(dayData["day"]["date"]);
		}
	},
	drawHoverPointer: function (event)
	{
		paper.projects[1].activate();
		var data = this.dataController.timelineData;
		// if event is inside canvas AND we have data
		if (event.point.x >= 0 && event.point.x <= view.viewSize.width && event.point.y >= 0 && event.point.y <= view.viewSize.height && data) {
			var dayData = this.getTimelineDataForPosition(data, event.point.x);
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
	getTimelineDataForPosition: function (data, x)
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
});