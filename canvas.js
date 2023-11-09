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
		  [1075, 726, 1361, 778], // botttom right [credits]
		  [1170, 780, 1361, 795], // bottom right [credits url small]
		  [876, 45, 1367, 80] // top right [url]
		  ]
const POSLOGO = [53, 15] // [53, 15, 803, 125]
const SIZELOGO = [750, 110]

const STUPID_OFFSETS = {
	Shulk: [0.5, 0.25], 
	Byleth: [0.5, 0.25]
}

var canvas = document.getElementById('canvas');
canvas.width = SIZE[0];
canvas.height = SIZE[1];
var ctx = canvas.getContext('2d');

ctx.beginPath();
ctx.rect(0, 0, SIZE[0], SIZE[1]);
ctx.fillStyle = 'limegreen';
ctx.fill();

function run() {
	eventData("tournament/p-neke-popoff-56-illuminating-dullbulb-s-secrets/event/ultimate-singles").then(data => {
		console.log(data);
	
		var images = [];
	
		for (let i = 0; i < 8; i++) {
			const player = data.players[i];
			const mainChar = Object.keys(player.chars)[0];
	
			images[i] = new Image();
			images[i].src = `assets/ssbu/murals/${mainChar.replace(" ", "_")}-3.png`;
	
			if(mainChar in STUPID_OFFSETS) {
				if(i == 7) {
					images[i].onload = () => {
						drawImageProp(ctx, images[i], POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], STUPID_OFFSETS[mainChar][0], STUPID_OFFSETS[mainChar][1]); 
						finish();
					};
				} else {
					images[i].onload = () => drawImageProp(ctx, images[i], POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], STUPID_OFFSETS[mainChar][0], STUPID_OFFSETS[mainChar][1]);
				}
			} else {
				if(i == 7) {
					images[i].onload = () => {
						drawImageProp(ctx, images[i], POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], 0.5, 0); 
						finish();
					};
				} else {
					images[i].onload = () => drawImageProp(ctx, images[i], POS[i][0], POS[i][1], SIZE_SQUARE[i], SIZE_SQUARE[i], 0.5, 0);
				}
			}
		}
	})
}

function finish() {
	var base_image = new Image();
	base_image.src = 'assets/marco.png';
	base_image.onload = () => ctx.drawImage(base_image, 0, 0);
}