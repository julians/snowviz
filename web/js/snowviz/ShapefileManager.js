var snowviz = snowviz || {};

snowviz.ShapefileManager = L.Class.extend({
	mapView: null, 
	shapefiles: [
		{ 
			title: "North",
			description: "Lorem ipsum dolor sit amet, consecteturetus. Nunc ulrat laoreet magna ultrices.",
			poly: [
				[38.411281,67.049966],
				[49.414403,68.044934],
				[40.411746,69.044752]
			]
		},
		{ 
			title: "South",
			description: "Lorem ipsum dolor sit amet, consectetur adipis magna ultrices.",
			poly: [
				[38.421281,65.059966],
				[49.424403,66.054934],
				[40.421746,67.054752]
			]
		},
		{ 
			title: "East",
			description: "Lorem ipsum dolor sit amet, consecleo arcu c leo metus. Nunc ultrices eniices.",
			poly: [
				[38.431281,61.069966],
				[49.434403,62.064934],
				[40.431746,63.064752]
			]
		}
	],
	newShapefile: {

		title: "Border",
			description: "Lorem ipsum dolor sit amet, consecteturetus. Nunc ulrat laoreet magna ultrices.",
			poly: [
				[37.411281,68.049966],
				[48.414403,69.044934],
				[39.411746,70.044752]
			]
	},
	welt: [
		[-180,-180],
		[180,-180],
		[180,180],
		[-180,180]
	],
	currentLayer: "#Bounds",
	polygonLayer: null,
	add1: 1572/2*0.0050865689142654,
	add2: 151*0.0050865689142654,
	initialize: function(options) {
		console.log("init Layermanager");
		this.initEvents();
		this.initShapefiles();
		this.updateLayers(this.currentLayer);	
		this.mapView = options.mapView;
	},
	initEvents: function () {
		// Click event on layers
		var self = this;
		$("#pile").on("click","li",function() 
		{
			var boo = $(this).find("a").attr("href");
			self.updateLayers(boo);
		});

		//
		$("#buttons li").on("click",function() 
		{
			self = this;
			var detectedClass = $(this).attr('class');

			switch(detectedClass)
				{
				case "createRegion":
					console.log("-> createRegion");
					break;
				case "importShape":
					console.log("-> importShape");
					// self.importShape();
					break;
				default:
					console.log("no link");
				}
		});
	},
	initShapefiles: function() {
		// "load" the shapefiles into the UI
		for(var i in this.shapefiles) {
			var shape = this.shapefiles[i];
			console.log(shape);
			$("#pile ul").append("<li><a href='#"+ shape.title+"' id='#"+shape.title+"'>"+shape.title+"</a></li>");
		}
	},
	updateLayers: function (intIndex) {
		//console.log($('#pile li').length);
		console.log("booooo")
		$('#pile li').each(function() {


			if($(this).find("a").attr("href") == intIndex){
				//console.log("yes");
				$(this).addClass('layerOn');
				$(this).removeClass('layerOff');

			}else{
				//console.log("no");
				$(this).addClass('layerOff');
				$(this).removeClass('layerOn');
			}
		});

		this.updateMap(intIndex);
	},
	updateMap: function(intIndex) {
		var self = this;
		var intIndex = intIndex.substr(1);
		//console.log(intIndex);

		if(this.polygonLayer){
			console.log("deletation of the current outline");
			this.mapView.removeLayer(polygonLayer);
		}

		if (intIndex == "Bounds") 
		{
			console.log("no shape file to load");

		}else{

			var currentShapefile =  _.where(this.shapefiles,{title: intIndex});
			var poly = currentShapefile[0].poly;
			
			this.polygonLayer = L.polygon([this.welt,poly],{color: "#ff7800", weight: 0.1}).addTo(this.mapView);

			//readjusting the bounds of the map to the selected shape file
			var positivePoly = L.polygon(poly);
			this.mapView.fitBounds(positivePoly.getBounds());
		};
	}, 
	importShape: function () {
		// test the new shapefile

		// collection of all the titles into an array
		var tmpTitles = _.pluck(this.shapefiles, 'title');
		console.log("tmpTitles");
		console.log(tmpTitles);

		// very basic check to see if the shapefile is already in the pile
		if(_.contains(tmpTitles, this.newShapefile.title)) {
			console.log("gibt schon");
		} else {
			// adding the new shapefile to the main json
			$("#pile ul").append("<li><a href='#"+ this.newShapefile.title+"' id='#"+ this.newShapefile.title+"'>"+ this.newShapefile.title+"</a></li>");

			this.shapefiles.push(this.newShapefile);
			this.updateLayers("#"+ this.newShapefile.title);
		}
	}
});
