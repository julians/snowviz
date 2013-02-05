var LayerManager = {
	shapefiles = [
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
	newShapefile = {

		title: "Border",
			description: "Lorem ipsum dolor sit amet, consecteturetus. Nunc ulrat laoreet magna ultrices.",
			poly: [
				[37.411281,68.049966],
				[48.414403,69.044934],
				[39.411746,70.044752]
			]
	},
	welt = [
		[-180,-180],
		[180,-180],
		[180,180],
		[-180,180]
	],
	currentLayer = "#Bounds",
	polygonLayer,
	add1 = 1572/2*0.0050865689142654,
	add2 = 151*0.0050865689142654,
	bounds = new L.LatLngBounds([38.41, 67], [38.41+add2, 67+add1]),
	init: function() {
		console.log("init Layermanager");
		LayerManager.initEvents();
		LayerManager.initShapefiles();
		LayerManager.updateLayers();	
	},
	initEvents = function () {
		// Click event on layers
		$("#pile").on("click","li",function() 
		{
			console.log($(this));
			updateLayers($(this).find("a").attr("href"));
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
	initShapefiles = function() {
		// "load" the shapefiles into the UI
		for(var i in shapefiles) {
			var shape = shapefiles[i];
			$("#pile ul").append("<li><a href='#"+shape.title+"' id='#"+shape.title+"'>"+shape.title+"</a></li>");
		}
	},
	updateLayers = function (intIndex) {
		//console.log($('#pile li').length);

		$('#pile li').each(function() {

			//console.log($(this).find("a").attr("href"));

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

		updateMap(intIndex);
	},
	updateMap = function(intIndex) {
		var intIndex = intIndex.substr(1);
		//console.log(intIndex);

		if(polygonLayer){
			console.log("deletation of the current outline");
			map.removeLayer(polygonLayer);
		}

		if (intIndex == "Bounds") 
		{
			console.log("no shape file to load");

		}else{
			//console.log("shape file: "+intIndex);

			var currentShapefile =  _.where(shapefiles,{title: intIndex});
			var poly = currentShapefile[0].poly;

			polygonLayer = L.polygon([welt,poly],{color: "#ff7800", weight: 0.1}).addTo(map);

			//readjusting the bounds of the map to the selected shape file
			var positivePoly = L.polygon(poly);
			map.fitBounds(positivePoly.getBounds());
		};
	}, 
	importShape = function () {
		// test the new shapefile

		// collection of all the titles into an array
		var tmpTitles = _.pluck(shapefiles, 'title');
		console.log("tmpTitles");
		console.log(tmpTitles);

		// very basic check to see if the shapefile is already in the pile
		if(_.contains(tmpTitles, newShapefile.title)) {
			console.log("gibt schon");
		} else {
			// adding the new shapefile to the main json
			$("#pile ul").append("<li><a href='#"+newShapefile.title+"' id='#"+newShapefile.title+"'>"+newShapefile.title+"</a></li>");

			shapefiles.push(newShapefile);
			updateLayers("#"+newShapefile.title);
		}
	}
}