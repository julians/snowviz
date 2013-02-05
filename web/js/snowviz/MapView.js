var snowviz = snowviz || {};

snowviz.MapView = L.Class.extend({
	includes: L.Mixin.Events,
	map: null,
	options: {
		tileLayerURL: 'http://localhost:8888/v2/Snowviz_cd4e28/{z}/{x}/{y}.png',
		initialMapBounds: [[38.7, 67], [39.4680719060540754, 70.99804316661260440000]]
	},
	snowLayer: null,
	dataController: null,
	initialize: function (options)
	{
		var bounds = new L.LatLngBounds(this.options.initialMapBounds);
		this.map = L.map('map', {
			center: bounds.getCenter(),
		    zoom : 10,
			attributionControl: false
		});
		L.tileLayer(this.options.tileLayerURL).addTo(this.map);
		if (options && options.dataController) {
			console.log("MapView: registering dataController")
			this.dataController = options.dataController;
			this.dataController.addEventListener("snowDataChanged", this.updateSnowLayer.bind(this));
		}
	},
	updateSnowLayer: function ()
	{
		console.log("MapView: updating snow layer");
		
		var data = this.dataController.getMapSnowData();
		
		var newSnowLayer = new L.TileLayer.SnowCoverage({
			'opacity': 1,
			"rectSize": data.cellsize
		});
		
		newSnowLayer.setData(data.points);
		if (this.snowLayer != null) this.map.removeLayer(this.snowLayer);
		this.snowLayer = newSnowLayer;
		this.map.addLayer(this.snowLayer);
		
		console.log("MapView: done updating snow layer");
	}
});