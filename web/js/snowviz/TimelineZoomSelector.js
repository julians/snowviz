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
				this.dataController.setRange(7);
			  	break;
			case "month":
				this.dataController.setRange(30);
			  	break;
			case "year":
				this.dataController.setRange(365);
			  	break;
			case "5years":
				// super-scientific leap year calculation ;)
				this.dataController.setRange(365*5+1);
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
			case 7:
				this.inputs.filter("[value=week]").attr("checked", true);
			  	break;
			case 30:
				this.inputs.filter("[value=month]").attr("checked", true);
			  	break;
			case 365:
				this.inputs.filter("[value=year]").attr("checked", true);
			  	break;
			case 365*5+1:
				// super-scientific leap year calculation ;)
				this.inputs.filter("[value=5years]").attr("checked", true);
			  	break;
			default:
				this.inputs.filter(":checked").attr("checked", false);
		}
	}
});