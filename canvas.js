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

const STUPID_OFFSETS = {
	ultimate: {
		Shulk: [0.5, 0.25], 
		Byleth: [0.5, 0.25],
		Terry: [0.5, 0],
		Falco: [0, 0],
		Bayonetta: [0, 0],
		Ganondorf: [0.5, 0],
		Lucas: [1, 0],
		Zelda: [0.5, 0]
	}
}

const POSITION_OFFSETS = {
	ultimate: {
		Falco: [30, 0],
		Ganondorf: [0, -5],
		Lucas: [-5, 0]
	}
}

const CROPS = {
	ultimate: {
		Bayonetta: [1000, -200],
		Lucas: [-200, 0],
		Bowser: [0, -300]
	}
}

const FLIPS = {
	ultimate: [
		"Fox",
		"Incineroar",
		"Bayonetta"
	]
}

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

document.getElementById("startgglink").click();

function go() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var radioButtons = document.querySelectorAll('input[name="style"]');
	let style;
	for (var radioButton of radioButtons) {
		if (radioButton.checked) {
			style = radioButton.value;
			break;
		}
	}

	switch (style) {
		case "pop":
			PRIMARY_COLOR = "#682f77";
			SECONDARY_COLOR = "#ff3d8b";
			BACKGROUND_IMAGE = 'assets/pop_background.png';
			break;
		case "resplat":
			PRIMARY_COLOR = "rgb(48, 47, 123)";
			SECONDARY_COLOR = "rgb(219, 36, 38)";
			BACKGROUND_IMAGE = 'assets/respawn_platform_poster_medium.png';
			break;
		case "ranbats":
			PRIMARY_COLOR = "#D93033";
			SECONDARY_COLOR = "#F7F8F0";
			BACKGROUND_IMAGE = 'assets/welly_ranbats.jpg';
			break;
		default:
			break;
	}

	var input = document.getElementById("startgglink").value.replace("events", "event");
	console.log(input.matchAll(startGGre), m => m[3]);

	eventData(Array.from(input.matchAll(startGGre), m => m[3])).then(data => {
		console.log(data);
		var base_image = new Image();
		base_image.src = BACKGROUND_IMAGE;
		base_image.onload = () => {
			drawImageProp(ctx, base_image, 0, 0, SIZE[0], SIZE[1]);
			ctx.beginPath();
			ctx.rect(0, 0, SIZE[0], SIZE[1]);
			ctx.fillStyle = '#0000004D'; //darken
			ctx.fill();

			var imagesToLoad = 0;

			for (let i = 0; i < Math.min(data.players.length, 8); i++) {
		
				const player = data.players[i];
				console.log(data.players[i])
				const mainChar = player.chars[0][0];
		
				var image = new Image();
				var tag = player.tag;
				if(player.tag.includes(" | ")) {
					tag = player.tag.split(" | ")[1];
				}

				// if(data["game"] == "melee") {
				// 	offsetY = 0;
				// 	if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[mainChar]) {
				// 		image.src = `assets/${data["game"]}/renders/${mainChar.split(' ').join('_').replace("&", "_")}_Standard_${PLAYER_OVERRIDES[tag].characters[data["game"]][mainChar] + 1}_CSP_HD.png`;
				// 	} else {
				// 		image.src = `assets/${data["game"]}/renders/${mainChar.split(' ').join('_').replace("&", "_")}_Standard_1_CSP_HD.png`;
				// 	}
				// } else {
					if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[mainChar]) {
						image.src = `assets/${data["game"]}/renders/${mainChar.split(' ').join('_').replace("&", "_")}-${PLAYER_OVERRIDES[tag].characters[data["game"]][mainChar]}.png`;
					} else {
						image.src = `assets/${data["game"]}/renders/${mainChar.split(' ').join('_')}-0.png`;
					}
				// }
		
				
				
		
				image.onload = (e) => {
					var offsetX = 0.5;
					var offsetY = 0.5;
					var posOffsetX = 0;
					var posOffsetY = 0;
					var cropX = 0;
					var cropY = 0;
					var flips = false;

					if(data["game"] == "melee") {
						offsetY = 0;
					}

					if(STUPID_OFFSETS?.[data["game"]]?.[mainChar]) {
						console.log(mainChar)
						offsetX = STUPID_OFFSETS[data["game"]][mainChar][0];
						offsetY = STUPID_OFFSETS[data["game"]][mainChar][1];
					}
					if(POSITION_OFFSETS?.[data["game"]]?.[mainChar]) {
						posOffsetX = POSITION_OFFSETS[data["game"]][mainChar][0];
						posOffsetY = POSITION_OFFSETS[data["game"]][mainChar][1];
					}
					if(CROPS?.[data["game"]]?.[mainChar]) {
						cropX = CROPS[data["game"]][mainChar][0];
						cropY = CROPS[data["game"]][mainChar][1];
					}
					if(FLIPS?.[data["game"]]) {
						if(FLIPS?.[data["game"]].includes(mainChar)) {
							flips = true;
						}
					}

					drawImageProp(ctx, e.target, POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], offsetX, offsetY, posOffsetX, posOffsetY, cropX, cropY, flips, true); 
					imagesToLoad++;
					if(imagesToLoad == (Math.min(data.players.length, 8) - 1)) {
						secondaries(data);
					}
				}
				image.onerror = function(){
					imagesToLoad++;
					if(imagesToLoad == (Math.min(data.players.length, 8) - 1)) {
						secondaries(data);
					}
				}
			}
		};

	})
}

var SMALL_ICON = 32;
var MED_ICON = 48;
var LARGE_ICON = 64;

function secondaries(data) {
	var totalImagesToMake = 0;
	for (let i = 0; i < Math.min(data.players.length, 8); i++) {
		const player = data.players[i];
		for (let j = 1; j < player.chars.length; j++) {
			if(player.chars[j][0]) {
				totalImagesToMake++;
			}
		}
	}
	var totalImagesMade = 0;
	for (let i = 0; i < Math.min(data.players.length, 8); i++) {

		const player = data.players[i];
		var char_offset = 0;

		for (let j = 1; j < player.chars.length; j++) {
			const element = player.chars[j][0];
			const currentI = i;
			const current_char_offset = char_offset;
			image = new Image();

			var image = new Image();
			var tag = player.tag;
			if(player.tag.includes(" | ")) {
				tag = player.tag.split(" | ")[1];
			}

			if(data["game"] == "ultimate") {
				if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[element]) {
					image.src = `assets/${data["game"]}/stock_icons/chara_2_${convertNamesToInternal(element)}_0${parseInt(PLAYER_OVERRIDES[tag].characters[data["game"]][element])}.png`;
				} else {
					image.src = `assets/${data["game"]}/stock_icons/chara_2_${convertNamesToInternal(element)}_00.png`;
				}
			} else if(data["game"] == "melee") {
				if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[element]) {
					image.src = `assets/${data["game"]}/stock_icons/${element.split(' ').join('_').replace("&", "_")}_Standard_${parseInt(PLAYER_OVERRIDES[tag].characters[data["game"]][element]) + 1}_STC_HD.png`;
				} else {
					image.src = `assets/${data["game"]}/stock_icons/${element.split(' ').join('_').replace("&", "_")}_Standard_1_STC_HD.png`;
				}
			} else {
				SMALL_ICON = 48;
				LARGE_ICON = 96;
				if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[element]) {
					image.src = `assets/${data["game"]}/stock_icons/${element.split(' ').join('_').replace("&", "_")}-${PLAYER_OVERRIDES[tag].characters[data["game"]][element]}.png`;
				} else {
					image.src = `assets/${data["game"]}/stock_icons/${element.split(' ').join('_')}-0.png`;
				}
			}


			image.onload = (e) => {
				var size;
				var right_margin;
				var iconSize = SMALL_ICON;

				if (currentI == 0) {
					size = BIG
				} else if (currentI < 4) {
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

				drawImageProp(ctx, e.target, POS[i][0] + size[0] - iconSize - right_margin, POS[i][1] + current_char_offset * (iconSize + 4) + right_margin, iconSize, iconSize);
				totalImagesMade++;
				if(totalImagesMade == (totalImagesToMake - 1)) {
					overlay(data);
				}
			};
			image.onerror = function(){
				totalImagesMade++;
				if(totalImagesMade == (totalImagesToMake - 1)) {
					overlay(data);
				}
			}
			char_offset++;
		}
	}
}

// Returns the renderable image (canvas)
function createCanvas(width, height) {
    return Object.assign(document.createElement("canvas"), {width, height});
}

function overlay(data) {
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
			numbers(data);
		}
	};
}

function numbers(data) {
	var base_image = new Image();
	base_image.src = 'assets/numeros.png';
	base_image.onload = () => {
		ctx.drawImage(base_image, 0, 0);
		text(data);
	};
}

var font_color1 = "#ffffff";
var font_color2 = "#ffffff";
var font_shadow1 = "#000000";
var font_shadow2 = "#000000";
var the_font = 'assets/fonts/DFGothic-with_macron_O.woff2';

function text(data) {

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
	fitText(ctx, POSTXT[0], data["toptext"], the_font, 30, align="left", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[1], data["bottomtext"], the_font, 30, align="left", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[2], "Design by:  @Elenriqu3", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	fitText(ctx, POSTXT[3], "Generator by: @Riokaru", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	fitText(ctx, POSTXT[4], "   Fork by: @stick_twt", the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)

	fitText(ctx, POSTXT[5], data["url"], the_font, 30, align="right", alignv="middle", fill=font_color2, shadow=font_shadow2)
	
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
		
			var tag = data.players[i].tag;
			if(data.players[i].tag.includes(" | ")) {
				tag = data.players[i].tag.split(" | ")[1];
			}

			if (data.players[i]["twitter"] || PLAYER_OVERRIDES[tag]?.twitter) {
				let color;
		
				// if (customcolor) {
				// 	color = customcolor;
				// } else {
					// color = "rgba(255, 40, 56, 255)";
				// }
		
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
				var twitter;
				
				if(PLAYER_OVERRIDES[tag]?.twitter) {
					twitter = "@" + PLAYER_OVERRIDES[tag]?.twitter;
				} else {
					twitter = data.players[i]["twitter"];
				}
				fitText(
					ctx,
					twitter_box,
					twitter,
					the_font,
					54,
					"center",
					"middle",
					font_color1,
					font_shadow1
				);
			}
		
			const name = data.players[i]["tag"].replace(". ", ".").replace(" | ", "|");
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
				name, 
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