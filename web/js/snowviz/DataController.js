var snowviz = snowviz || {};

snowviz.DataController = L.Class.extend({
	includes: L.Mixin.Events,
	firstDate: null,
	lastDate: null,
	currentDate: null,
	currentRange: 0,
	timelineData: null,
	mapSnowData: null,
	initialize: function ()
	{
		this.firstDate = moment("2012-01-01");
		this.lastDate = moment("2012-01-01").add("days", 151);
		this.currentDate = moment("2012-01-01");
		this.currentRange = 0;
	},
	initData: function ()
	{
		this.fireEvent("dateChanged");
		this.loadDataForCurrentDate();
		this.loadDataForTimeline();
	},
	loadDataForTimeline: function()
	{
		console.log("DataController: loading timeline data");
		var self = this;
		$.getJSON('http://localhost:5000/graph?callback=?', function(response) {
			self.timelineData = response;
			self.fireEvent("timelineDataChanged");
		});
	},
	loadDataForCurrentDate: function()
	{
		console.log("DataController: loading data for current date");
		var self = this;
		var params = {
			startdate: this.currentDate.format("YYYY-MM-DD"),
			enddate: moment(this.currentDate).add("days", this.currentRange).format("YYYY-MM-DD")
		};
		$.getJSON(
			'http://localhost:5000/daterange?callback=?', params,
			function(data) {
				console.log("DataController: got some data");
				self.mapSnowData = data;
				self.fireEvent("snowDataChanged", {
					date: data.date,
					range: self.currentRange
				});
			}
		);
	},
	getMapSnowData: function ()
	{
		return this.mapSnowData;
	},
	getTimelineData: function ()
	{
		return this.timelineData;
	},
	setDateAndRange: function (newDate, newRange)
	{
		console.log("DataController: setDateAndRange to " + newDate + ", " + newRange);
		
		var newDate = moment(newDate);
		var range = newRange || this.currentRange;
		var maxRange = this.getMaxPossibleRange();
		if (range > maxRange) range = maxRange;
		if (newDate == this.currentDate && range == this.currentRange) {
			return range;
		}
		
		if (newDate >= this.firstDate && newDate <= this.lastDate) {
			this.currentDate = newDate;
		}
		maxRange = this.getMaxPossibleRange();
		range = newRange || this.currentRange;
		if (range > maxRange) range = maxRange;
		this.currentRange = range;
		
		console.log("DataController: date changed");
		this.fireEvent("dateChanged");
		this.loadDataForCurrentDate();
		
		return range;
	},
	getCurrentDateOffset: function ()
	{
		var startdateIndex = moment.duration(this.currentDate-this.firstDate);
		return Math.floor(startdateIndex.asDays());
	},
	getFirstSelectedDate: function ()
	{
		return this.currentDate;
	},
	getLastSelectedDate: function ()
	{
		var lastSelectedDate = moment(this.currentDate);
		lastSelectedDate.add("days", this.currentRange);
		if (lastSelectedDate <= this.lastDate) return lastSelectedDate;
		return this.lastDate;
	},
	getFirstSelectedDateIndex: function ()
	{
		return this.currentDate.diff(this.firstDate, "days");
	},
	getLastSelectedDateIndex: function ()
	{
		return this.getLastSelectedDate().diff(this.firstDate, "days");
	},
	isFirstDateSelected: function ()
	{
		return this.getCurrentDateOffset() == 0;
	},
	isLastDateSelected: function ()
	{
		var daysFromLastDate = moment.duration(this.lastDate-this.currentDate);
		console.log(daysFromLastDate.asDays());
		console.log(this.currentRange);
		return (this.daysFromLastDate - this.currentRange) == 0;
	},
	setRange: function (range)
	{
		var maxRange = this.getMaxPossibleRange
		if (range > maxRange) {
			range = maxRange;
		}
		this.currentRange = range;
		this.fireEvent("dateChanged");
		this.loadDataForCurrentDate();
		return range;
	},
	getMaxPossibleRange: function()
	{
		var maxRange = moment.duration(this.lastDate-this.currentDate);
		return Math.floor(maxRange.asDays());
	},
	goToDate: function (newDate)
	{
		var newDate = moment(newDate);
		this.setDateAndRange(newDate);
	},
	goToNextDate: function ()
	{
		console.log("DataController: goToNextDate");
		var nextDate = moment(this.currentDate).add("days", 1);
		return this.setDateAndRange(nextDate);
	},
	goToPreviousDate: function ()
	{
		console.log("DataController: goToPreviousDate");
		var previousDate = moment(this.currentDate).subtract("days", 1);
		return this.setDateAndRange(previousDate);
	}
});