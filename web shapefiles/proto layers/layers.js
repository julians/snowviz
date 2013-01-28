$(document).ready(function () {


var shapefiles = [
	{ 
		title: "North",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ante elit, placerat ac eleifend a, faucibus quis diam. Nullam sodales pellentesque pretium. Fusce porta, lacus in tristique ornare, nibh urna feugiat lectus, id condimentum leo lectus in eros. Nam nisl elit, feugiat vitae tempor in, venenatis vel massa. Phasellus viverra mauris imperdiet lacus tempor nec egestas sapien tempor. Sed eget tristique massa. Mauris vestibulum, quam in varius auctor, nunc enim pulvinar magna, vitae semper leo arcu at leo. Maecenas nec leo metus. Nunc ultrices enim vel libero rhoncus placerat laoreet magna ultrices."
	},
	{ 
		title: "South",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ante elit, placerat ac eleifend a, faucibus quis diam. Nullam sodales pellentesque pretium. Fusce porta, lacus in tristique ornare, nibh urna feugiat lectus, id condimentum leo lectus in eros. Nam nisl elit, feugiat vitae tempor in, venenatis vel massa. Phasellus viverra mauris imperdiet lacus tempor nec egestas sapien tempor. Sed eget tristique massa. Mauris vestibulum, quam in varius auctor, nunc enim pulvinar magna, vitae semper leo arcu at leo. Maecenas nec leo metus. Nunc ultrices enim vel libero rhoncus placerat laoreet magna ultrices."

	},
	{ 
		title: "East",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ante elit, placerat ac eleifend a, faucibus quis diam. Nullam sodales pellentesque pretium. Fusce porta, lacus in tristique ornare, nibh urna feugiat lectus, id condimentum leo lectus in eros. Nam nisl elit, feugiat vitae tempor in, venenatis vel massa. Phasellus viverra mauris imperdiet lacus tempor nec egestas sapien tempor. Sed eget tristique massa. Mauris vestibulum, quam in varius auctor, nunc enim pulvinar magna, vitae semper leo arcu at leo. Maecenas nec leo metus. Nunc ultrices enim vel libero rhoncus placerat laoreet magna ultrices."

	}
];

for(var i in shapefiles) {
	var shape = shapefiles[i];
	$("#pile ul").append("<li><a href='#"+shape.title+"' id='#"+shape.title+"'>"+shape.title+"</a></li>");
}

var currentLayer = "#Bounds";
updateLayers(currentLayer);

$("#pile li").click(function() {
	updateLayers($(this).find("a").attr("href"));
	console.log($(this));
});

function updateLayers(intIndex) {
	console.log(intIndex);	

	$('#pile li').each(function() {

		console.log($(this).find("a").attr("href"));
  		
  		if($(this).find("a").attr("href") == intIndex){
  			console.log("yes");
  			$(this).addClass('layerOn');
  			$(this).removeClass('layerOff');

  		}else{
  			console.log("no");
  			$(this).addClass('layerOff');
  			$(this).removeClass('layerOn');
  		}



	});

}







});