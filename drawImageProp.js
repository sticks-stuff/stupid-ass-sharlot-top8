/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY, posOffsetX = 0, posOffsetY = 0, cropX = 0, cropY = 0, flips = false, shadow = false) {

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
    // w -= posOffsetX;
    var x2  = x + posOffsetX;

    // img.height += posOffsetY;
    var y2 = y - posOffsetY;
    var h2 = h + posOffsetY;

    var iw = imgWidth,
        ih = imgHeight,
        r = Math.min(w2 / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w2) ar = w2 / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h2 / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = (iw / (nw / w2));
    ch = (ih / (nh / h2));

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle

    if(shadow) {
        var shadowCanvas = createCanvas(w2, h2).getContext("2d");
        shadowCanvas.beginPath();
		shadowCanvas.rect(0, 0, w2, h2);
		shadowCanvas.fillStyle = PRIMARY_COLOR;
		shadowCanvas.fill();
        shadowCanvas.globalCompositeOperation = "destination-in";
        // shadowCanvas.drawImage(img, cx, cy, cw, ch, x, y, w, h)
        var shadowOffset = w*0.03;
        if (flips) {
            shadowCanvas.translate(shadowOffset + w2/2, shadowOffset + w2/2);
            shadowCanvas.scale(-1, 1);
            shadowCanvas.translate(-(shadowOffset + w2/2), -(shadowOffset + w2/2));
        }
        console.log(w*0.03);
        shadowCanvas.drawImage(img, cx, cy, cw, ch, shadowOffset, shadowOffset, w2, h2);
        // drawImageProp(shadowCanvas, img, x, y, w, h, offsetX, offsetY, posOffsetX + (w*0.3), posOffsetY, cropX + (w*0.3), cropY + (w*0.3), flips, false);
        // drawImageProp(shadowCanvas, img, x + w*0.03, y + w*0.03, w - w*0.03, h - w*0.03, offsetX, offsetY, posOffsetX, posOffsetY, cropX, cropY, flips, false);
        // ctx.drawImage(shadowCanvas.canvas, 0, 0);
        ctx.drawImage(shadowCanvas.canvas, x2, y2);
        // ctx.drawImage(shadowCanvas.canvas, w*0.03, w*0.03);
        // ctx.setTransform(1, 0, 0, 1, 0, 0);
        // drawImageProp(ctx, shadowCanvas.canvas, x + w*0.03, y + w*0.03, w, h, offsetX, offsetY, posOffsetX, posOffsetY, cropX, cropY, flips, false);
    }

    
    if (flips) {
        ctx.translate(x2 + w2/2, y2 + w2/2);
        ctx.scale(-1, 1);
        ctx.translate(-(x2 + w2/2), -(y2 + w2/2));
    }

    ctx.drawImage(img, cx, cy, cw, ch, x2, y2, w2, h2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}