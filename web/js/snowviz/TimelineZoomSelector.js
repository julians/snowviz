var snowviz = snowviz || {};

snowviz.TimelineZoomSelector = L.Class.extend({
	includes: L.Mixin.Events,
	initialize: function (options)
	{
		this.dataController = options.dataController;
		this.dataController.addEventListener("dateChanged", this.dateChanged.bind(this));
		this.inputs = $("#zoom-selector input");
		this.inputs.change(this.zoomChanged.bind(this));
	},
	zoomChanged: function (event)
	{
		var value = $(event.currentTarget).val();
		console.log(value);
		
		switch (value) {
			case "day":
				this.dataController.setRange(0);
			  	break;
			case "week":
				this.dataController.setRange(6);
			  	break;
			case "month":
				this.dataController.setRange(29);
			  	break;
			case "year":
				this.dataController.setRange(364);
			  	break;
			case "5years":
				// super-scientific leap year calculation ;)
				this.dataController.setRange(365*5);
			  	break;
		}
	},
	dateChanged: function ()
	{
		var range = this.dataController.currentRange;
		
		switch (range) {
			case 0:
				this.inputs.filter("[value=day]").attr("checked", true);
			  	break;
			case 6:
				this.inputs.filter("[value=week]").attr("checked", true);
			  	break;
			case 29:
				this.inputs.filter("[value=month]").attr("checked", true);
			  	break;
			case 364:
				this.inputs.filter("[value=year]").attr("checked", true);
			  	break;
			case 365*5:
				// super-scientific leap year calculation ;)
				this.inputs.filter("[value=5years]").attr("checked", true);
			  	break;
			default:
				this.inputs.filter(":checked").attr("checked", false);
		}
	}
});