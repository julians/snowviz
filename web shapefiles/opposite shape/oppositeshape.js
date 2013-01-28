// This is the canvas where you want to draw
var canvas = document.getElementById('your-canvas');
var ctx = canvas.getContext('2d');

// I'll use a skyblue background that covers everything
// Just to demonstrate
ctx.fillStyle = "skyblue";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Create a canvas that we will use as a mask
var maskCanvas = document.createElement('canvas');
// Ensure same dimensions
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
var maskCtx = maskCanvas.getContext('2d');

// This color is the one of the filled shape
maskCtx.fillStyle = "black";
// Fill the mask
maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
maskCtx.globalCompositeOperation = 'xor';
// Change color for xor operation
maskCtx.fillStyle = "white";
// Draw the shape you want to take out
maskCtx.arc(30, 30, 10, 0, 2 * Math.PI);
maskCtx.fill();

// Draw mask on the image, and done !
ctx.drawImage(maskCanvas, 0, 0);