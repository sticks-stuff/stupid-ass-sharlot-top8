// this sucks LMAO

function imgChanged(charDropdownId) {
    var charDropdown = document.getElementById(charDropdownId + "char");
	var customOption = document.getElementById(charDropdownId + 'custom');
	if (!customOption) {
        customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.text = 'Custom';
        customOption.id = charDropdownId + 'custom';
        document.getElementById(charDropdownId + "char").add(customOption);
    }
    charDropdown.value = 'custom';
	updateAlts("custom", document.getElementById(charDropdownId + "alt"));
}

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
		<label for="player${i}charImg">custom: </label>
		<input type="file" id="player${i}charImg" name="player${i}charImg" accept="image/*" onchange="imgChanged('player${i}')">
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
		<label for="player${i}secondary${secondaryCount}charImg">custom: </label>
        <input type="file" id="player${i}secondary${secondaryCount}charImg" name="player${i}secondary${secondaryCount}charImg" accept="image/*" onchange="imgChanged('player${i}secondary${secondaryCount}')">
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
		if (char.value != 'custom') {
            document.getElementById("player" + i + "secondary" + secondaryCount + "charImg").value = '';
			var customOption = document.getElementById("player" + i + 'custom');
			if (customOption) {
				charDropdown.removeChild(customOption);
			}
        }
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
			if (document.getElementById("player" + i + "char").value != 'custom') {
				document.getElementById("player" + i + "charImg").value = '';
				var customOption = document.getElementById("player" + i + 'custom');
				if (customOption) {
					charDropdown.removeChild(customOption);
				}
			}
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

			console.log({tag})
			
			document.getElementById(`player${i + 1}name`).value = tag.replace(". ", ".").replace(" | ", "|");
			
			if(tag.includes(" | ")) {
				tag = tag.split(" | ")[1];
			}

			var twitter = ""
			if(PLAYER_OVERRIDES[tag]?.twitter) {
				twitter = "@" + PLAYER_OVERRIDES[tag]?.twitter;
			} else {
				twitter = data.players[i]["twitter"];
			}
			document.getElementById(`player${i + 1}twt`).value = twitter;

			var mainChar = player.chars[0][0].split(' ').join('_').replace("&", "_").replace("-", "_");
			document.getElementById(`player${i + 1}char`).value = mainChar;
			updateAlts(document.getElementById(`player${i + 1}char`).value, document.getElementById(`player${i + 1}alt`));

			if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[0][0]]) {
				document.getElementById(`player${i + 1}alt`).value = PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[0][0]];
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