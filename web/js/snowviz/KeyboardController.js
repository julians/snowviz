var snowviz = snowviz || {};

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