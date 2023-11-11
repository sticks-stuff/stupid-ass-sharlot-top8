function drawText(ctx, pos, text, font, fill = 'rgb(255, 255, 255)', shadow = null, shadowOffset = [0.55, 0.55], outlineThickness = 0, outlineColor = null) {
	// console.log(`CTX.FONT ${font}`);
	if (shadow) {
		const offsetX = Math.floor(Math.sqrt(font.size) * shadowOffset[0]);
		const offsetY = Math.floor(Math.sqrt(font.size) * shadowOffset[1]);
		ctx.fillStyle = shadow;
		ctx.font = font;
		ctx.fillText(text, pos[0] + offsetX, pos[1] + offsetY);
	}

	ctx.fillStyle = fill;
	ctx.font = font;
	ctx.fillText(text, pos[0], pos[1]);

	if (outlineThickness > 0) {
		ctx.lineWidth = outlineThickness;
		ctx.strokeStyle = outlineColor || fill;
		ctx.strokeText(text, pos[0], pos[1]);
	}
}

function measureHeight(aFont, aSize, aChars, aOptions={}) { // https://stackoverflow.com/a/36729322
    // if you do pass aOptions.ctx, keep in mind that the ctx properties will be changed and not set back. so you should have a devoted canvas for this
    // if you dont pass in a width to aOptions, it will return it to you in the return object
    // the returned width is Math.ceil'ed
    // console.error('aChars: "' + aChars + '"');
    var defaultOptions = {
        width: undefined, // if you specify a width then i wont have to use measureText to get the width
        canAndCtx: undefined, // set it to object {can:,ctx:} // if not provided, i will make one
        range: 3
    };

    aOptions.range = aOptions.range || 3; // multiples the aSize by this much

    if (aChars === '') {
        // no characters, so obviously everything is 0
        return {
            relativeBot: 0,
            relativeTop: 0,
            height: 0,
            width: 0
        };
        // otherwise i will get IndexSizeError: Index or size is negative or greater than the allowed amount error somewhere below
    }

    // validateOptionsObj(aOptions, defaultOptions); // not needed because all defaults are undefined

    var can;
    var ctx; 
    if (!aOptions.canAndCtx) {
        can = document.createElement('canvas');;
        can.mozOpaque = 'true'; // improved performanceo on firefox i guess
        ctx = can.getContext('2d');

        // can.style.position = 'absolute';
        // can.style.zIndex = 10000;
        // can.style.left = 0;
        // can.style.top = 0;
        // document.body.appendChild(can);
    } else {
        can = aOptions.canAndCtx.can;
        ctx = aOptions.canAndCtx.ctx;
    }

    var w = aOptions.width;
    if (!w) {
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left'; 
        ctx.font = aFont;
        w = ctx.measureText(aChars).width;
    }

    w = Math.ceil(w); // needed as i use w in the calc for the loop, it needs to be a whole number

    // must set width/height, as it wont paint outside of the bounds
    can.width = w;
    can.height = aSize * aOptions.range;

    ctx.font = aFont; // need to set the .font again, because after changing width/height it makes it forget for some reason
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left'; 

    ctx.fillStyle = 'white';

    // console.log('w:', w);

    var avgOfRange = (aOptions.range + 1) / 2;
    var yBaseline = Math.ceil(aSize * avgOfRange);
    // console.log('yBaseline:', yBaseline);

    ctx.fillText(aChars, 0, yBaseline);

    var yEnd = aSize * aOptions.range;

    var data = ctx.getImageData(0, 0, w, yEnd).data;
    // console.log('data:', data)

    var botBound = -1;
    var topBound = -1;

    // measureHeightY:
    for (y=0; y<=yEnd; y++) {
        for (var x = 0; x < w; x += 1) {
            var n = 4 * (w * y + x);
            var r = data[n];
            var g = data[n + 1];
            var b = data[n + 2];
            // var a = data[n + 3];

            if (r+g+b > 0) { // non black px found
                if (topBound == -1) { 
                    topBound = y;
                }
                botBound = y; // break measureHeightY; // dont break measureHeightY ever, keep going, we till yEnd. so we get proper height for strings like "`." or ":" or "!"
                break;
            }
        }
    }

    return {
        relativeBot: botBound - yBaseline, // relative to baseline of 0 // bottom most row having non-black
        relativeTop: topBound - yBaseline, // relative to baseline of 0 // top most row having non-black
        height: (botBound - topBound) + 1,
        width: w// EDIT: comma has been added to fix old broken code.
    };
}

async function fitText(ctx, box, text, fontdir, guess = 30, align = "left", alignv = "top", fill = 'rgb(255, 255, 255)', shadow = 'rgba(0,0,0,0)', shadowOffset = [0.55, 0.55], forcedFont = null, outlineThickness = 0, outlineColor = null) {
	
	// console.log({guess});
	
	const [x1, y1, x2, y2] = box;
	
	// console.log(text, box);
	
	// ctx.strokeStyle = 'purple';
	// ctx.stroke();
	
	const width = x2 - x1;
	const height = y2 - y1;
	// console.log("WHAT THE FUCK???")
	// ctx.rect(x1, y1, width, height);
	// console.log(`${text}ctx.rect(${x1}, ${y1}, ${width}, ${height})`);
	// console.log("WHAT THE FUCK???")
	// ctx.strokeStyle = 'purple';
	// ctx.stroke();
	
	
	// console.log({box}, {text}, {width}, {height})

	// console.log({x1}, {y1}, {width}, {height});

	let fontSize = guess; // Initial font size (you can adjust this)
	let minSize = 1;
	let maxSize = guess;
	// console.log({maxSize})
	let font = await loadFont(fontdir, maxSize);
	ctx.font = font
	var textWidth = ctx.measureText(text).width;
	var textHeight = parseInt(font, 10);
	// console.log({ textWidth })
	// console.log({ width })

	while (textWidth >= width || textHeight >= height) {
		// const middleSize = Math.floor((minSize + maxSize) / 2);
		// console.log({ middleSize })

		font = await loadFont(fontdir, maxSize);
		ctx.font = await loadFont(fontdir, maxSize);
		textWidth = ctx.measureText(text).width;
		textHeight = parseInt(font, 10);
		// const textHeight = middleSize; // Assuming height is proportional to font size
		// console.log({ textWidth })
		// console.log({ maxSize })

		// if (textWidth <= width) {
		maxSize = maxSize - 1;
		// }
	}

	// var [textWidth, textHeight] = [ctx.measureText(text).width, parseInt(font, 10)];
	// console.log(`THE MEASURED TEXT WIDTH OF ${text} IS ${textWidth}`);
	// console.log(`THE MAX SIZE OF ${text} IS ${maxSize}`);
	// console.log(`THE MAX WIDTH WIDTH OF ${text} IS ${width}`);
	console.log(`FONT OF ${text} IS ${font}`);

	let posX = x1;
	let posY = y1;

	if (align === "center") {
		ctx.textAlign = "center";

		posX += (width / 2);
	} else if (align === "right") {
		posX += width - textWidth;
	}

	if (alignv === "bottom") {
		posY += height - measureHeight(font, maxSize, text).relativeBot;
	} else if (alignv === "middle") {
		// var thing = measureHeight(font, maxSize, text)
		// console.log({text}, {thing})
		posY += (height - (measureHeight(font, maxSize, text).relativeTop) - measureHeight(font, maxSize, text).height * 1.15) + measureHeight(font, maxSize, text).relativeBot;
	}



	drawText(ctx, [posX, posY], text, font, fill, shadow);
}

async function loadFont(fontdir, size) {
	const font = new FontFace('DFGothic-SU', `url(${fontdir})`, { style: 'normal', weight: 'normal', size: `${size}px` });
	await font.load();
	document.fonts.add(font);
	return `${size}px DFGothic-SU`;
}

function drawText(ctx, pos, text, font, fill = 'rgb(255, 255, 255)', shadow = null, shadowOffset = [0.55, 0.55], outlineThickness = 0, outlineColor = null) {
	if (shadow) {
		ctx.shadowOffsetX = Math.floor(Math.sqrt(parseInt(font, 10)) * shadowOffset[0]);
		ctx.shadowOffsetY = Math.floor(Math.sqrt(parseInt(font, 10)) * shadowOffset[1]);
		ctx.shadowColor = shadow;
		// const offsetX = Math.floor(Math.sqrt(font.size) * shadowOffset[0]);
		// const offsetY = Math.floor(Math.sqrt(font.size) * shadowOffset[1]);
		// ctx.fillStyle = fill;
		// ctx.font = font;
		// ctx.fillText(text, pos[0] + offsetX, pos[1] + offsetY);
	}

	ctx.fillStyle = fill;
	ctx.font = font;
	ctx.fillText(text, pos[0], pos[1]);

	// if (outlineThickness > 0) {
	// 	ctx.lineWidth = outlineThickness;
	// 	ctx.strokeStyle = outlineColor || fill;
	// 	ctx.strokeText(text, pos[0], pos[1]);
	// }
	ctx.shadowColor = null;
	ctx.shadowOffsetY = 0;
	ctx.shadowOffsetX = 0;
}



