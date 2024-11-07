const SIZE = [1423,800] // Size of the whole canvas
const SIZE_SQUARE = [482, 257, 257, 257, 191, 191, 191, 191]
const BIG = [482, 482] // Size of the biggest character square [1st place]
const MED = [257, 257] // Size of the medium character squares [2nd to 4th places]
const SMA = [191, 191] // Size of the small character squares [5th place and lower]
// Position of the top left pixel of each square
const POS = [[53, 135], [553, 135], [831, 135], [1110, 135],
	   [553, 441], [760, 441], [968, 441], [1176, 441]]
// Size of twitter boxes
const SIZETWI = [[483, 39], [257, 29], [257, 29], [257, 29],
		   [192, 26], [192, 26], [192, 26], [192, 26]]
// Position of the top left pixel of each twitter box
const POSTWI = [[52, 624], [552, 398], [831, 398], [1109, 398],
		  [552, 637], [759, 637], [967, 637], [1175, 637]]
// Boxes of texts in the corner
const POSTXT = [[53, 45, 803, 80], // top left
		  [53, 730, 997, 765], // bottom left
		  [1075, 690, 1361, 742], // botttom right [credits2]
		  [1075, 716, 1361, 768], // botttom right [credits]
		  [1075, 743, 1361, 795], // bottom right [credits3]
		  [876, 45, 1367, 80] // top right [url]
		  ]
const POSLOGO = [53, 15] // [53, 15, 803, 125]
const SIZELOGO = [750, 110]

var PRIMARY_COLOR = "#682f77"
var SECONDARY_COLOR = "#ff3d8b"
var BACKGROUND_IMAGE = 'assets/pop_background.png'

var canvas = document.getElementById('canvas');
canvas.width = SIZE[0];
canvas.height = SIZE[1];
var ctx = canvas.getContext('2d');

// ctx.beginPath();
// ctx.rect(0, 0, SIZE[0], SIZE[1]);
// ctx.fillStyle = 'black';
// ctx.fill();

// let f = new FontFace("DFGothic-SU", "url('assets/fonts/DFGothic-SU-WIN-RKSJ-H.woff2')");

// f.load().then(function(font) {
// 	document.fonts.add(font);
// 	ctx.font = "135px DFGothic-SU";
// 	ctx.fillText("1", 62, 279);
// })


// function drawTextToFit(context, text, maxWidth, maxHeight) {
  
// 	let fontSize = 40; // Initial font size (you can adjust this)
// 	let minSize = 1;
// 	let maxSize = 100;
  
// 	while (minSize <= maxSize) {
// 	  const middleSize = Math.floor((minSize + maxSize) / 2);
// 	  context.font = `${middleSize}px Arial`;
  
// 	  const textWidth = context.measureText(text).width;
// 	  const textHeight = middleSize; // Assuming height is proportional to font size
  
// 	  if (textWidth <= maxWidth && textHeight <= maxHeight) {
// 		fontSize = middleSize;
// 		minSize = middleSize + 1;
// 	  } else {
// 		maxSize = middleSize - 1;
// 	  }
// 	}
  
// 	// Clear the canvas and draw the text with the optimal font size
// 	context.clearRect(0, 0, canvas.width, canvas.height);
// 	context.font = `${fontSize}px Arial`;
// 	context.fillText(text, 0, fontSize);
  
// 	// Optionally, return the calculated font size
// 	return fontSize;
//   }
  
//   const optimalFontSize = drawTextToFit(ctx, '7', 1233 - 1179, 498 - 444);
//   console.log(`Optimal Font Size: ${optimalFontSize}`);

// overlay();

const startGGre = /https:\/\/(www\.)?(smash|start)\.gg\/(tournament\/[^\/]+\/event\/[^\/]+)/g;

function styleChanged() {
	var radioButtons = document.querySelectorAll('input[name="style"]');
	for (var radioButton of radioButtons) {
		if (radioButton.checked) {
			style = radioButton.value;
			break;
		}
	}
	switch (style) {
		case "pop":
			document.getElementById("primaryColor").value = "#682f77";
			document.getElementById("secondaryColor").value = "#ff3d8b";
			BACKGROUND_IMAGE = 'assets/pop_background.png';
			break;
		case "resplat":
			document.getElementById("primaryColor").value = "#302f7b";
			document.getElementById("secondaryColor").value = "#db2426";
			BACKGROUND_IMAGE = 'assets/respawn_platform_poster_medium.png';
			break;
		case "ranbats":
			document.getElementById("primaryColor").value = "#D93033";
			document.getElementById("secondaryColor").value = "#F7F8F0";
			BACKGROUND_IMAGE = 'assets/welly_ranbats.jpg';
			break;
		default:
			break;
	}
}

function handleImageOnload(i, imagesToLoad, img, char = false, alt = false) {
    return async (e) => {
        var offsetX = 0.5;
        var offsetY = 0;
        var posOffsetX = 0;
        var posOffsetY = 0;
        var cropX = 0;
        var cropY = 0;
        var flips = false;
        var shadows = true;
		var customZoom = 1.2;
        var customCenter = [0.5, 0.3];

        var game = document.getElementById("game").value;
		var gameYoffset = 0;
        var mainChar = document.getElementById(`player${i + 1}char`).value;
        var pack = document.getElementById("pack").value;

        try {
            const response = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/${pack}/config.json`);
            const config = await response.json();
            mainChar = gameConfig.character_to_codename[mainChar].codename;
            const eyesight = config.eyesights[mainChar]["0"];

            let proportional_zoom = 1;
            if (config.average_size) {
                proportional_zoom = 0;
                proportional_zoom = Math.max(
                    proportional_zoom,
                    (SIZE_SQUARE[i] / config.average_size.x) * 1.2
                );
                proportional_zoom = Math.max(
                    proportional_zoom,
                    (SIZE_SQUARE[i] / config.average_size.y) * 1.2
                );
            }
            const zoom_x = SIZE_SQUARE[i] / img.naturalWidth;
            const zoom_y = SIZE_SQUARE[i] / img.naturalHeight;

            let minZoom = 1;
			const rescalingFactor = config?.rescaling_factor?.char?.alt || 1;
            const uncropped_edge = config.uncropped_edge || [];

            if (!uncropped_edge || uncropped_edge.length == 0) {
                if (zoom_x > zoom_y) {
                    minZoom = zoom_x * rescalingFactor;
                } else {
                    minZoom = zoom_y * rescalingFactor;
                }
            } else {
                if (
                    uncropped_edge.includes("u") &&
                    uncropped_edge.includes("d") &&
                    uncropped_edge.includes("l") &&
                    uncropped_edge.includes("r")
                ) {
                    minZoom = customZoom * proportional_zoom * rescalingFactor;
                } else if (
                    !uncropped_edge.includes("l") &&
                    !uncropped_edge.includes("r")
                ) {
                    minZoom = zoom_x * rescalingFactor;
                } else if (
                    !uncropped_edge.includes("u") &&
                    !uncropped_edge.includes("d")
                ) {
                    minZoom = zoom_y * rescalingFactor;
                } else {
                    minZoom = customZoom * proportional_zoom * rescalingFactor;
                }
            }

            const zoom = Math.max(minZoom, customZoom * minZoom);

            let xx = -eyesight.x * zoom + SIZE_SQUARE[i] / 2;
            let maxMoveX = SIZE_SQUARE[i] - img.naturalWidth * zoom;

            if (!uncropped_edge || !uncropped_edge.includes("l")) {
                if (xx > 0) xx = 0;
            }
            if (!uncropped_edge || !uncropped_edge.includes("r")) {
                if (xx < maxMoveX) xx = maxMoveX;
            }

            let yy;
            if (!customCenter) {
                yy = -eyesight.y * zoom + SIZE_SQUARE[i] / 2;
				console.log("Did not use custom center value: ", yy);
            } else {
                yy = -eyesight.y * zoom + SIZE_SQUARE[i] * customCenter[1];
				console.log("Used custom center value: ", yy);
            }
			console.log("Initial yy value:", yy);

            let maxMoveY = SIZE_SQUARE[i] - img.naturalHeight * zoom;

            if (!uncropped_edge || !uncropped_edge.includes("u")) {
                if (yy > 0) yy = 0;
            }
            if (!uncropped_edge || !uncropped_edge.includes("d")) {
                if (yy < maxMoveY) yy = maxMoveY;
            }

			console.log("Final yy value:", yy);
			
			// const offsetX = 0.5 - (xx + img.naturalWidth / 2) / img.naturalWidth;
			// const offsetY = 0.5 - (yy + img.naturalHeight / 2) / img.naturalHeight;

			console.log(offsetX, offsetY);
			console.log("asjkdhaskhjd " + (yy * (img.naturalHeight / SIZE_SQUARE[i])))

			console.log(img.src);
			console.log({offsetX})
			console.log({offsetY})
			// cropX = (((img.naturalWidth * zoom) - SIZE_SQUARE[i]) / zoom) - (Math.abs(xx) * (img.naturalWidth / SIZE_SQUARE[i]));
			cropX = (((img.naturalWidth * zoom) - SIZE_SQUARE[i]) / zoom) - (Math.abs(xx) * (img.naturalWidth / SIZE_SQUARE[i]));
			cropY = (((img.naturalHeight * zoom) - SIZE_SQUARE[i]) / zoom) - (Math.abs(yy) * (img.naturalHeight / SIZE_SQUARE[i]));
			if (img.src.includes("Johnny")) {
				// xx -= 400;
			}
			// offsetX = (xx + img.naturalWidth / 2) / img.naturalWidth;
			// offsetY = (yy + img.naturalHeight / 2) / img.naturalHeight;

			resizeInCanvas(img, img.naturalWidth * zoom, img.naturalHeight * zoom).then((resized) => {
				console.log("here")
				var char = document.createElement("div");
				char.style.width = SIZE_SQUARE[i] + "px";
				char.style.height = SIZE_SQUARE[i] + "px";
				// char.style.backgroundPosition = `${xx}px ${yy - 30}px`;
				char.style.backgroundPosition = `${xx}px ${yy}px`;
				char.style.backgroundSize = `${img.naturalWidth * zoom}px ${img.naturalHeight * zoom}px`;
				char.style.backgroundImage = `url(${resized})`;
				char.style.backgroundRepeat = "no-repeat";
				
				var offScreenContainer = document.createElement("div");
				offScreenContainer.style.position = "absolute";
				offScreenContainer.style.left = "-9999px";
				offScreenContainer.appendChild(char);
				document.body.appendChild(offScreenContainer);

				console.log("here2")
				html2canvas(char, {backgroundColor: null, useCORS: true}).then(function(canvas) {
					ctx.drawImage(canvas, POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i]);
					char.remove();
					imagesToLoad.num++;
					if (imagesToLoad.num >= 8) {
						secondaries();
					}
				});
			})

			// drawImageProp(ctx, img, POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], 0, 0, posOffsetX, posOffsetY, cropX, cropY, flips, shadows, -xx, -yy);

            // drawImageProp(ctx, img, POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], 0.5, 0.5, posOffsetX, posOffsetY, (((img.naturalWidth * zoom) - SIZE_SQUARE[i]) / zoom), ((img.naturalHeight * zoom) - SIZE_SQUARE[i]) / zoom, flips, shadows, -xx, -yy);
			// drawImageWithBackgroundProperties(ctx, img, POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], xx, yy, img.naturalWidth * zoom, img.naturalHeight * zoom);

            console.log("Variables calculated: ", {
                imgSrc: img.src,
                zoom: zoom,
                uncroppedEdge: uncropped_edge,
                rescalingFactor: rescalingFactor,
                minZoom: minZoom,
                proportionalZoom: proportional_zoom,
                zoomX: zoom_x,
                zoomY: zoom_y,
                eyesight: eyesight,
                xx: xx,
                yy: yy,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                width: img.width,
                height: img.height,
                img: img,
            });
        } catch (error) {
            console.error("Error fetching eyesight data:", error);
        }
    };
}

function go() {
	ctx.imageSmoothingEnabled = true;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	PRIMARY_COLOR = document.getElementById("primaryColor").value;
	SECONDARY_COLOR = document.getElementById("secondaryColor").value;

	var input = document.getElementById("startgglink").value.replace("events", "event");
	console.log(input.matchAll(startGGre), m => m[3]);

	var base_image = new Image();
	if(document.getElementById("backgroundImage").files[0] != null) {
		base_image.src = URL.createObjectURL(document.getElementById("backgroundImage").files[0]);
	} else {
		base_image.src = BACKGROUND_IMAGE;
	}
	base_image.onload = async () => {
		await drawImageProp(ctx, base_image, 0, 0, SIZE[0], SIZE[1]);
		ctx.beginPath();
		ctx.rect(0, 0, SIZE[0], SIZE[1]);
		ctx.fillStyle = '#0000004D'; //darken
		ctx.fill();

		var imagesToLoad = { num: 0 };

		for (let i = 0; i < 8; i++) {
			var mainChar = document.getElementById(`player${i + 1}char`).value;

			if(mainChar == "none") {
				imagesToLoad.num++;
				if(imagesToLoad >= 8) {
					secondaries();
				}
				continue;
			}
	
			var image = new Image();
			var game = document.getElementById("game").value;
			var pack = document.getElementById("pack").value;

			if(game == "roa") {
				ctx.imageSmoothingEnabled = false;
			}

			var charImgInput = document.getElementById(`player${i + 1}charImg`);
			if (mainChar == "custom") {
				var reader = new FileReader();
				reader.onload = function(e) {
					var image = new Image();
					image.src = e.target.result;
					image.onload = handleImageOnload(i, imagesToLoad);
					image.onerror = function(){
						imagesToLoad.num++;
						if(imagesToLoad.num >= 8) {
							secondaries();
						}
					}
				};
				reader.readAsDataURL(charImgInput.files[0]);
			} else {
				const fetchPackConfig = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/${pack}/config.json`);
				var packConfig = await fetchPackConfig.json();
				const fetchGameConfig = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/config.json`);
				gameConfig = await fetchGameConfig.json();

				console.log(mainChar);

				mainChar = gameConfig.character_to_codename[mainChar].codename;

				image.src = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/${pack}/${packConfig.prefix}${mainChar}${packConfig.postfix}${document.getElementById(`player${i + 1}alt`).value}`;
				image.crossOrigin = 'anonymous';
				image.onload = handleImageOnload(i, imagesToLoad, image, mainChar, document.getElementById(`player${i + 1}alt`).value);
				image.onerror = function(){
					imagesToLoad.num++;
					if(imagesToLoad.num >= 8) {
						secondaries();
					}
				}
			}

		}
	};

}

var SMALL_ICON = 32;
var MED_ICON = 48;
var LARGE_ICON = 64;

function handleSecondaryImageOnLoad(i, char_offset, totalImages) {
	return (e) => {
		console.log({char_offset})
		var size;
		var right_margin;
		var iconSize = SMALL_ICON;

		if (i == 0) {
			size = BIG
		} else if (i < 4) {
			size = MED
		} else {
			size = SMA
		}

		if(size == BIG) {
			right_margin = 14;
			iconSize = LARGE_ICON;
		} else if (size == MED) {
			right_margin = 8;
			iconSize = MED_ICON;
		} else {
			right_margin = 6;
		}

		drawImageProp(ctx, e.target, POS[i][0] + size[0] - iconSize - right_margin, POS[i][1] + char_offset * (iconSize + 4) + right_margin, iconSize, iconSize);
		totalImages.made++;
		console.log({totalImages})
		if(totalImages.made >= (totalImages.toMake - 1)) {
			overlay();
		}
	};
}

async function secondaries() {
	console.log("here")
	var totalImages = { made: 0, toMake: 0 };
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < document.getElementById(`player${i + 1}secondary`).childElementCount; j++) {
			if(document.getElementById(`player${i + 1}secondary${j}char`).value != "none") {
				totalImages.toMake++;
			}
		}
	}
	if(totalImages.toMake == 0) {
		overlay();
	}
	for (let i = 0; i < 8; i++) {
		var char_offset = 0;

		for (let j = 0; j < document.getElementById(`player${i + 1}secondary`).childElementCount; j++) {
			var element = document.getElementById(`player${i + 1}secondary${j}char`).value;
			if(element == "none") {
				totalImages.made++;
				if(totalImages.made >= (totalImages.toMake - 1)) {
					ctx.imageSmoothingEnabled = true;
					overlay();
				}
				continue;
			}
			image = new Image();

			var image = new Image();
			var game = document.getElementById("game").value;
			var pack = document.getElementById("pack").value;

			var charImgInput = document.getElementById(`player${i + 1}secondary${j}charImg`);

			if(game == "roa") {
				ctx.imageSmoothingEnabled = false;
			}

			if (element == "custom") {
				var reader = new FileReader();
				const current_char_offset = char_offset;
				reader.onload = function(e) {
					var image = new Image();
					image.src = e.target.result;
					image.onload = handleSecondaryImageOnLoad(i, current_char_offset, totalImages);
					image.onerror = function(){
						totalImages.made++;
						if(totalImages.made >= (totalImages.toMake - 1)) {
							ctx.imageSmoothingEnabled = true;
							overlay();
						}
					}
				};
				char_offset++;
				reader.readAsDataURL(charImgInput.files[0]);
			} else {
				// if(game == "ultimate") {
				// 	image.src = `assets/${game}/stock_icons/chara_2_${convertNamesToInternal(element)}_0${document.getElementById(`player${i + 1}secondary${j}alt`).value}.png`;
				// } else if(game == "roa") {
				// 	image.src = `assets/${game}/stock_icons/${element.split(' ').join('_').replace("&", "_")}.png`; //we dont use alts in stock icons for roa
				// } else if(game == "roa2") {
				// 	image.src = `assets/${game}/stock_icons/${element.split(' ').join('_').replace("&", "_")}.png`; //same for roa2
				// } else {
					SMALL_ICON = 48;
					LARGE_ICON = 96;
					// if(game == "pplus") {
						// image.src = `assets/${game}/stock_icons/${element.split(' ').join('_').replace("&", "_")}-0.png`; //we dont have alts for stock icons for p+ yet
					// } else {		
						const fetchPackConfig = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/config.json`);
						var packConfig = await fetchPackConfig.json();
						const fetchGameConfig = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/config.json`);
						gameConfig = await fetchGameConfig.json();

						console.log(element)
						element = gameConfig.character_to_codename[element].codename;

						const response = await fetch(`https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${packConfig.prefix}${element}${packConfig.postfix}${document.getElementById(`player${i + 1}secondary${j}alt`).value}`);
						if (response.ok) {
							image.src = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${packConfig.prefix}${element}${packConfig.postfix}${document.getElementById(`player${i + 1}secondary${j}alt`).value}`;
							image.crossOrigin = 'anonymous';
						} else {
							const fetchJson = await fetch('paths.json');
							json = await fetchJson.json();
							image.src = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${packConfig.prefix}${element}${packConfig.postfix}${json[game]["icon"][element][0]}`;
							image.crossOrigin = 'anonymous';
						}
						
					// }
				// }
				image.onload = handleSecondaryImageOnLoad(i, char_offset, totalImages);
	
				image.onerror = function(){
					totalImages.made++;
					if(totalImages.made >= (totalImages.toMake - 1)) {
						ctx.imageSmoothingEnabled = true;
						overlay();
					}
				}
				char_offset++;
			}

		}
	}
}

// Returns the renderable image (canvas)
function createCanvas(width, height) {
    return Object.assign(document.createElement("canvas"), {width, height});
}

function overlay() {
	var canvas1 = createCanvas(SIZE[0], SIZE[1]).getContext("2d");
	var canvas2 = createCanvas(SIZE[0], SIZE[1]).getContext("2d");
	
	var marco = new Image();
	marco.src = 'assets/marco.png';
	marco.onload = (e) => {
		canvas1.beginPath();
		canvas1.rect(0, 0, SIZE[0], SIZE[1]);
		canvas1.fillStyle = PRIMARY_COLOR;
		canvas1.fill();
		canvas1.globalCompositeOperation = "destination-in";
		canvas1.drawImage(marco, 0, 0);

		var polo = new Image();
		polo.src = 'assets/polo.png';
		polo.onload = (e) => {
			canvas2.beginPath();
			canvas2.rect(0, 0, SIZE[0], SIZE[1]);
			canvas2.fillStyle = SECONDARY_COLOR;
			canvas2.fill();
			canvas2.globalCompositeOperation = "destination-in";
			canvas2.drawImage(polo, 0, 0);

			ctx.drawImage(canvas1.canvas, 0, 0);
			ctx.drawImage(canvas2.canvas, 0, 0);
			// ctx.drawImage(polo, 0, 0);
			numbers();
		}
	};
}

function numbers() {
	var base_image = new Image();
	base_image.src = 'assets/numeros.png';
	base_image.onload = () => {
		ctx.drawImage(base_image, 0, 0);
		text();
	};
}

var font_color1 = "#ffffff";
var font_color2 = "#ffffff";
var font_shadow1 = "#000000";
var font_shadow2 = "#000000";
var the_font = 'assets/fonts/DFGothic-with_macron_O.woff2';

function text() {

	// fitText(
	// 	ctx,
	// 	[1196.6, 638.3, 1367, 661.7],
	// 	"@Phinn_SSB",
	// 	'assets/fonts/DFGothic-SU-WIN-RKSJ-H-01.ttf',
	// 	54,
	// 	"center",
	// 	"middle"
	// );

	// fitText(ctx, box,       text,            fontdir, guess = 30, align = "left", alignv = "top", fill = 'rgb(255, 255, 255)', shadow = 'rgba(0,0,0,0)', shadowOffset = [0.55, 0.55], forcedFont = null, outlineThickness = 0, outlineColor = null)
	fitText(ctx, POSTXT[0], document.getElementById("toptext").value, the_font, 30, align="left", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[1], document.getElementById("bottomtext").value, the_font, 30, align="left", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[2], "Design by:  @Elenriqu3", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	fitText(ctx, POSTXT[3], "Generator by: @Riokaru", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	fitText(ctx, POSTXT[4], "   Fork by: @stick_twt", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[5], document.getElementById("url").value, the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	
	var image = new Image();
	image.src = `assets/pajarito.png`;

	image.onload = (e) => {
		var pajarito = e.target;
		for (let i = 0; i < 8; i++) {
			let size;
		
			if (i === 0) {
				size = BIG;
			} else if (i < 4) {
				size = MED;
			} else {
				size = SMA;
			}

			if (document.getElementById(`player${i + 1}twt`).value != "") {
		
				// Drawing twitter box
				ctx.fillStyle = PRIMARY_COLOR;
				ctx.fillRect(POSTWI[i][0], POSTWI[i][1], SIZETWI[i][0], SIZETWI[i][1]);
		
				// Twitter bird icon
				if (pajarito.height !== SIZETWI[i][1]) {
					const psize = [
						(pajarito.width * SIZETWI[i][1]) / pajarito.height,
						SIZETWI[i][1],
					];
					pajarito.width = psize[0];
					pajarito.height = psize[1];
				}
		
				ctx.drawImage(
					pajarito,
					POSTWI[i][0] + SIZETWI[i][0] * 0.02,
					POSTWI[i][1],
					pajarito.width,
					pajarito.height
				);
		
				// Other code for handling Twitter box dimensions, font, and text goes here
				// ...
				
				var margin = 0.075;
				var left_margin = pajarito.width*1.2
				var top_margin = margin*SIZETWI[i][1]
				var bottom_margin = margin*SIZETWI[i][1]
	
				var twitter_box = [
					POSTWI[i][0]+left_margin, 
					POSTWI[i][1]+top_margin,
					POSTWI[i][0]+SIZETWI[i][0],
					POSTWI[i][1]+SIZETWI[i][1]-bottom_margin
				]

				// console.log({twitter_box})
		
				// Twitter handle
				// ctx.font = ffont; // Assuming ffont is the font for Twitter handle
				// ctx.fillStyle = font_color1;
				// ctx.shadowColor = font_shadow1;

				fitText(
					ctx,
					twitter_box,
					document.getElementById(`player${i + 1}twt`).value,
					the_font,
					54,
					"center",
					"middle",
					font_color1,
					font_shadow1
				);
			}
		
			// const name = data.players[i]["tag"];

			var name_box;
		
			name_box = [
				POS[i][0] + 12,
				POS[i][1],
				POS[i][0] + size[0] - 12,
				POS[i][1] + size[1] * 0.98,
			];
		
			// Player name
			// ctx.font = the_font;
			// ctx.fillStyle = font_color1;
			// ctx.shadowColor = font_shadow1;

			fitText(
				ctx, 
				name_box, 
				document.getElementById(`player${i + 1}name`).value, 
				the_font,
				Math.round(size[0] * 0.26),
				"center",
				"bottom",
				font_color1,
				font_shadow1
			);
		}	
	}
	// fitText(ctx, [ 65, 135, 523, 607.36 ], "AlastairBL", 'assets/fonts/DFGothic-SU-WIN-RKSJ-H-01.ttf', Math.round(482 * 0.26), "center", "bottom");
	
	// const placing_numbers = [1,2,3,4,5,5,7,7]

	// let font = new FontFace("DFGothic-SU", "url(assets/fonts/DFGothic-SU-WIN-RKSJ-H-01.ttf)");

	// console.log({lo}, {hi}, {fontSize});
	// fitText(ctx, [1179, 444, 1233, 498], "7", 'assets/fonts/DFGothic-SU-WIN-RKSJ-H-01.ttf');

	// font.load().then(() => {

		// for (let i = 0; i < 8; i++) {
		// 	var posX = POS[i][0] + Math.floor(SIZE_SQUARE[i] * 0.02);
		// 	var posY = POS[i][1] + Math.floor(SIZE_SQUARE[i] * 0.02);
		// 	var boxWidth = POS[i][0] + Math.floor(SIZE_SQUARE[i] * 0.3);
		// 	var boxHeight = POS[i][1] + Math.floor(SIZE_SQUARE[i] * 0.3);
			
		// 	console.log("a")
		// 	console.log(posX, posY, boxWidth, boxHeight)
		// 	fitText(
		// 		ctx,
		// 		[posX, posY, boxWidth, boxHeight],
		// 		placing_numbers[i].toString(),
		// 		'assets/fonts/DFGothic-SU-WIN-RKSJ-H-01.ttf',
		// 		150,
		// 		'left',
		// 		'top',
		// 		font_color,
		// 		font_shadow
		// 	);
		// }
	// });



}

function saveCanvas() {
	var link = document.createElement('a');
	link.setAttribute('download', `${document.getElementById("toptext").value}.png`);
	link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
}