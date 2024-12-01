/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
pica = window.pica();

async function resizeInCanvas(image, width, height, pixely) {
	// Only resize if image is being downscaled
	if ((width >= image.width || height >= image.height) || pixely) {
	  return image.src;
	}
  
	// Initialize the canvas and its size
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
  
	// Set width and height
	canvas.width = width;
	canvas.height = height;

	// Define pica options
	const picaOptions = {
	    alpha: true
	};

	// Use pica to resize the image
	const result = await pica.resize(image, canvas, picaOptions);
	// Export to a data-uri
	const dataURI = await pica.toBlob(result, 'image/webp', 0.90);
  
	canvas.remove();
  
	// Do something with the result, like overwrite original
	return URL.createObjectURL(dataURI);
}

async function resizeInCanvasReturnCanvas(image, width, height, pixely) {
	// Only resize if image is being downscaled
	if ((width >= image.width || height >= image.height) || pixely) {
        return image;
      }
    
      // Initialize the canvas and its size
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
    
      // Set width and height
      canvas.width = width;
      canvas.height = height;
  
      // Define pica options
      const picaOptions = {
          alpha: true
      };
  
      // Use pica to resize the image
      const result = await pica.resize(image, canvas, picaOptions);
      // Export to a data-uri
    //   const dataURI = await pica.toBlob(result, 'image/webp', 0.90);
    
      canvas.remove();
    
      // Do something with the result, like overwrite original
      return result;
  }
  
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY, posOffsetX = 0, posOffsetY = 0, cropX = 0, cropY = 0, flips = false, shadow = false, offsetPixelX = 0, offsetPixelY = 0) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var imgWidth = img.width - cropX;
    var imgHeight = img.height - cropY;
    
    var w2 = w - posOffsetX;
    var x2  = x + posOffsetX;
    var y2 = Math.max(y + posOffsetY, y);
    var h2 = Math.min(h - posOffsetY, h + posOffsetY, h);

    var iw = imgWidth,
        ih = imgHeight,
        r = Math.min(w2 / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w2) ar = w2 / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h2) ar = h2 / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = (iw / (nw / w2));
    ch = (ih / (nh / h2));

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (offsetPixelX != 0 || offsetPixelY != 0) {
        cx = offsetPixelX;
        cy = offsetPixelY;
    }

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // Create an off-screen canvas for resizing
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = nw;
    offScreenCanvas.height = nh;
    const offScreenCtx = offScreenCanvas.getContext('2d');

    // Draw the image onto the off-screen canvas
    offScreenCtx.drawImage(img, cx, cy, cw, ch, 0, 0, nw, nh);

    // Use window.pica to resize the image
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = w2;
    resizedCanvas.height = h2;

    pica.resize(offScreenCanvas, resizedCanvas).then(result => {
        
            // Draw the resized image onto the main canvas
            if (shadow) {
                var shadowCanvas = createCanvas(w2, h2).getContext("2d");
                shadowCanvas.beginPath();
                shadowCanvas.rect(0, 0, w2, h2);
                shadowCanvas.fillStyle = PRIMARY_COLOR;
                shadowCanvas.fill();
                shadowCanvas.globalCompositeOperation = "destination-in";
                var shadowOffset = w * 0.03;
                if (flips) {
                    shadowCanvas.translate(shadowOffset + w2 / 2, shadowOffset + w2 / 2);
                    shadowCanvas.scale(-1, 1);
                    shadowCanvas.translate(-(shadowOffset + w2 / 2), -(shadowOffset + w2 / 2));
                }
                shadowCanvas.drawImage(resizedCanvas, shadowOffset, shadowOffset);
                ctx.drawImage(shadowCanvas.canvas, x2, y2);
            }
        
            if (flips) {
                ctx.translate(x2 + w2 / 2, y2 + w2 / 2);
                ctx.scale(-1, 1);
                ctx.translate(-(x2 + w2 / 2), -(y2 + w2 / 2));
            }
        
            ctx.drawImage(resizedCanvas, x2, y2);
            console.log("???")
            ctx.setTransform(1, 0, 0, 1, 0, 0);
    })
}

async function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY, posOffsetX = 0, posOffsetY = 0, cropX = 0, cropY = 0, flips = false, shadow = false, offsetPixelX = 0, offsetPixelY = 0) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var imgWidth = img.width - cropX;
    var imgHeight = img.height - cropY;
    
    var w2 = w - posOffsetX;
    var x2  = x + posOffsetX;
    var y2 = Math.max(y + posOffsetY, y);
    var h2 = Math.min(h - posOffsetY, h + posOffsetY, h);

    var iw = imgWidth,
        ih = imgHeight,
        r = Math.min(w2 / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w2) ar = w2 / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h2) ar = h2 / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle

    cw = (iw / (nw / w2));
    ch = (ih / (nh / h2));

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (offsetPixelX != 0 || offsetPixelY != 0) {
        cx += offsetPixelX;
        cy += offsetPixelY;
    }

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // Create an off-screen canvas for resizing
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = nw;
    offScreenCanvas.height = nh;
    const offScreenCtx = offScreenCanvas.getContext('2d');

    // Draw the image onto the off-screen canvas
    offScreenCtx.drawImage(img, cx, cy, cw, ch, 0, 0, nw, nh);

    // Use window.pica to resize the image
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = w2;
    resizedCanvas.height = h2;

    await pica.resize(offScreenCanvas, resizedCanvas)

    // Draw the resized image onto the main canvas
    if (shadow) {
        var shadowCanvas = createCanvas(w2, h2).getContext("2d");
        shadowCanvas.beginPath();
        shadowCanvas.rect(0, 0, w2, h2);
        shadowCanvas.fillStyle = PRIMARY_COLOR;
        shadowCanvas.fill();
        shadowCanvas.globalCompositeOperation = "destination-in";
        var shadowOffset = w * 0.03;
        if (flips) {
            shadowCanvas.translate(shadowOffset + w2 / 2, shadowOffset + w2 / 2);
            shadowCanvas.scale(-1, 1);
            shadowCanvas.translate(-(shadowOffset + w2 / 2), -(shadowOffset + w2 / 2));
        }
        shadowCanvas.drawImage(resizedCanvas, shadowOffset, shadowOffset);
        ctx.drawImage(shadowCanvas.canvas, x2, y2);
    }

    if (flips) {
        ctx.translate(x2 + w2 / 2, y2 + w2 / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(x2 + w2 / 2), -(y2 + w2 / 2));
    }

    ctx.drawImage(resizedCanvas, x2, y2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}