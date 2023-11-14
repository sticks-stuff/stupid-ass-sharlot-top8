// this sucks LMAO

var json = {};
(async function () {

const fetchJson = await fetch('alts.json');
json = await fetchJson.json();

var game = document.getElementById('game');

console.log(json);
for (const [key, value] of Object.entries(json)) {
	var option = new Option(key, key);
	game.appendChild(option);
}

game.addEventListener('change', function() {
	updateChars();
});

for(i = 1; i <= 8; i++) {
	var div = document.createElement('div'); 
	div.id = "player" + i;
	div.className = "playerForm";
	div.innerHTML = `
		Player ${i}
		<br>
		<label for="player${i}name">name: </label>
		<input type="text" id="player${i}name" name="player${i}name">
		<br>
		<label for="player${i}twt">twitter: </label>
		<input type="text" id="player${i}twt" name="player${i}twt">
		<br>
		<label for="player${i}char">main char: </label>
		<select name="player${i}char" id="player${i}char" id="player${i}char"></select>
		<br>
		<label for="player${i}alt">main char alt: </label>
		<select name="player${i}alt" id="player${i}alt" id="player${i}alt"></select>
		<br>
		<button onclick="addSecondaryChar(${i})">add secondary character</button>
		<div id="player${i}secondary">
		</div>
	`;
	document.getElementById("playerFormContainer").appendChild(div);
}

updateChars();

})();

var currentGame = "";

function addSecondaryChar(i) {
	var div = document.createElement('div'); 
	var secondaryCount = document.getElementById("player" + i + "secondary").childElementCount;
	div.id = "player" + i + "secondary" + secondaryCount;
	div.className = "secondaryChar";
	div.innerHTML = `
		<select name="player${i}secondary${secondaryCount}char" id="player${i}secondary${secondaryCount}char"></select>
		<select name="player${i}secondary${secondaryCount}alt" id="player${i}secondary${secondaryCount}alt"></select>
		<button onclick="removeSecondaryChar(${i}, ${secondaryCount})">remove</button>
	`;
	document.getElementById("player" + i + "secondary").appendChild(div);

	var char = document.getElementById("player" + i + "secondary" + secondaryCount + "char");
	char.innerHTML = "";
	var option = new Option("none", "none");
	char.appendChild(option);
	var game = document.getElementById('game').value;
	for (const [key, value] of Object.entries(json[game])) {
		var option = new Option(key, key);
		char.appendChild(option);
	}
	char.addEventListener('change', function() {
		updateAlts(document.getElementById("player" + i + "secondary" + secondaryCount + "char").value, document.getElementById("player" + i + "secondary" + secondaryCount + "alt"));
	});

	var alt = document.getElementById("player" + i + "secondary" + secondaryCount + "alt");
	alt.innerHTML = "";
	var option = new Option("none", "none");
	alt.appendChild(option);
	var game = document.getElementById('game').value;
	if(json[game][char]) {
		for (const [key, value] of Object.entries(json[game][char])) {
			var option = new Option(value, value);
			alt.appendChild(option);
		}
	}
}

function removeSecondaryChar(i, j) {
	document.getElementById("player" + i + "secondary").removeChild(document.getElementById("player" + i + "secondary" + j));
}

function updateChars() {
	for(let i = 1; i <= 8; i++) {
		for(let j = 0; j < document.getElementById("player" + i + "secondary").childElementCount; j++) {
			var char = document.getElementById("player" + i + "secondary" + j + "char");
			char.innerHTML = "";
			var option = new Option("none", "none");
			char.appendChild(option);
			var game = document.getElementById('game').value;
			for (const [key, value] of Object.entries(json[game])) {
				var option = new Option(key, key);
				char.appendChild(option);
			}
		}
		if(currentGame == document.getElementById('game').value) continue;
		var char = document.getElementById("player" + i + "char");
		char.innerHTML = "";
		var option = new Option("none", "none");
		char.appendChild(option);
		var game = document.getElementById('game').value;
		for (const [key, value] of Object.entries(json[game])) {
			var option = new Option(key, key);
			char.appendChild(option);
		}
		char.addEventListener('change', function() {
			updateAlts(document.getElementById("player" + i + "char").value, document.getElementById("player" + i + "alt"));
		});
		updateAlts(document.getElementById("player" + i + "char").value, document.getElementById("player" + i + "alt"));
	}
}

function updateAlts(char, alt) {
	alt.innerHTML = "";
	var game = document.getElementById('game').value;
	if(json[game][char]) {
		for (const [key, value] of Object.entries(json[game][char])) {
			var option = new Option(value, value);
			alt.appendChild(option);
		}
	}
}

function sendToForm() {
	var input = document.getElementById("startgglink").value.replace("events", "event");
	console.log(input.matchAll(startGGre), m => m[3]);

	eventData(Array.from(input.matchAll(startGGre), m => m[3])).then(data => {
		console.log(data);
		document.getElementById("game").value = data["game"];
		document.getElementById("toptext").value = data["toptext"];
		document.getElementById("bottomtext").value = data["bottomtext"];
		document.getElementById("url").value = data["url"];
		updateChars();

		for (let i = 0; i < Math.min(data.players.length, 8); i++) {
			const player = data.players[i];

			var tag = player.tag;
			
			document.getElementById(`player${i + 1}name`).value = tag.replace(". ", ".").replace(" | ", "|");;

			var twitter = ""
			if(PLAYER_OVERRIDES[tag]?.twitter) {
				twitter = "@" + PLAYER_OVERRIDES[tag]?.twitter;
			} else {
				twitter = data.players[i]["twitter"];
			}
			document.getElementById(`player${i + 1}twt`).value = twitter;

			var mainChar = player.chars[0][0].split(' ').join('_').replace("&", "_");
			document.getElementById(`player${i + 1}char`).value = mainChar;
			updateAlts(document.getElementById(`player${i + 1}char`).value, document.getElementById(`player${i + 1}alt`));
			
			if(tag.includes(" | ")) {
				tag = tag.split(" | ")[1];
			}

			if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[mainChar]) {
				document.getElementById(`player${i + 1}alt`).value = PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[mainChar];
			}

			// for (let j = 0; j < document.getElementById(`player${i + 1}secondary`).childElementCount; j++) {
			// 	removeSecondaryChar(i + 1, j);
			// }

			for (let j = 1; j < player.chars.length; j++) {
				var secondary = player.chars[j][0].split(' ').join('_').replace("&", "_");
				addSecondaryChar(i + 1);
				document.getElementById(`player${i + 1}secondary${j - 1}char`).value = secondary;
				updateAlts(document.getElementById(`player${i + 1}secondary${j - 1}char`).value, document.getElementById(`player${i + 1}secondary${j - 1}alt`));
				if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[j][0]]) {
					document.getElementById(`player${i + 1}secondary${j - 1}alt`).value = PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[j][0]];
				}
			}
		}
	});
}