var snowviz = snowviz || {};

snowviz.TimelineTextualDateDisplay = L.Class.extend({
	includes: L.Mixin.Events,
	initialize: function (options)
	{
		this.dataController = options.dataController;
		this.dataController.addEventListener("dateChanged", this.dateChanged.bind(this));
		this.startdateLabel = $("#startdateLabel");
		this.enddateLabel = $("#enddateLabel");
	},
	dateChanged: function ()
	{
		var startdate = moment(this.dataController.currentDate);
		var range = this.dataController.currentRange;
		var enddate = moment(startdate).add("days", range);
		
		this.startdateLabel.html(startdate.format("MMM D, YYYY"));
		this.enddateLabel.html(enddate.format("MMM D, YYYY"));
	}
});