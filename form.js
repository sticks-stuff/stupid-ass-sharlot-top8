// this sucks LMAO

function imgChanged(charDropdownId) {
	var charDropdown = document.getElementById(charDropdownId + "char");
	var customOption = charDropdown.msDropdown.namedItem('custom');
	if (customOption) {
		charDropdown.msDropdown.remove(customOption);
	}
	const input = document.getElementById(charDropdownId + 'charImg');
	if (input.files && input.files[0]) {
		const file = input.files[0];
		const imageUrl = URL.createObjectURL(file);
		var option = new Option("custom", "custom");
		option.setAttribute("name", "custom");
		option.setAttribute("data-image", imageUrl);
		charDropdown.msDropdown.add(option, 0);
		charDropdown.msDropdown.value = "custom";
	}
	updateAlts("custom", document.getElementById(charDropdownId + "alt"));
	try {
		saveFormState();
	} catch (e) {
		
	}
}

var json = {};
var gameConfig = {};
var packConfig = {};

var gamesLoaded = false;

(async function () {

	const fetchJson = await fetch('paths.json');
	json = await fetchJson.json();

	var game = document.getElementById('game');

	console.log(json);
	var ddJson = [];
	for (const [key, value] of Object.entries(json)) {
		let obj = {};
		obj.image = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${key}/base_files/logo_small.png`;
		obj.value = key;
		obj.text = value["name"];
		ddJson.push(obj);
	}
	new MsDropdown(game, {
		byJson: {
			data: ddJson, selectedIndex: 0, name: "game"
		},
		enableAutoFilter: true
	});


	game.addEventListener('change', async function() {
		await loadGameConfig().then(async () => {
			updatePacks();
			await updateChars();
		});
		for (let i = 1; i <= 8; i++) {
			const secondaryContainer = document.getElementById("player" + i + "secondary");
			for (let j = secondaryContainer.childElementCount - 1; j >= 0; j--) {
				removeSecondaryChar(i, j); //we remove this shit otherwise secondaries break when we change games
			}
		}
		try {
			saveFormState();
		} catch (e) {
			
		}
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
			<div name="player${i}char" id="player${i}char" id="player${i}char"></div>
			<br>
			<label for="player${i}alt">main char alt: </label>
			<div name="player${i}alt" id="player${i}alt" id="player${i}alt"></div>
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

	await loadGameConfig().then(async () => {
		updatePacks();
		await updateChars();
	});
	gamesLoaded = true;
})();

async function loadGameConfig() {
	var game = document.getElementById('game').msDropdown.value;
	if (game === "") return;
	const fetchConfig = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/config.json`);
	gameConfig = await fetchConfig.json();
}

async function loadPackConfig() {
	const game = document.getElementById('game').msDropdown.value;
	const pack = document.getElementById('pack').value;
	if (pack === "") return;
	const response = await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/${pack}/config.json`);
	packConfig = await response.json()
}

function updatePackInfo() {
	document.getElementById("pack_version").innerHTML = "";
	document.getElementById("pack_info").innerHTML = "";
	document.getElementById("pack_credits").innerHTML = "";

	if (document.getElementById('pack').value == "") {
		return;
	};
	loadPackConfig().then(() => {
		document.getElementById("pack_version").innerHTML = "Version " + packConfig.version || "";
		document.getElementById("pack_info").innerHTML = packConfig.description || "";
		document.getElementById("pack_credits").innerHTML = packConfig.credits || "";
	}).catch(error => {
		console.error("Error loading pack config:", error);
	});
	try {
		saveFormState();
	} catch (e) {
		
	}
}
var currentGame = "";

async function addSecondaryChar(i) {
	var div = document.createElement('div'); 
	var secondaryCount = document.getElementById("player" + i + "secondary").childElementCount;
	div.id = "player" + i + "secondary" + secondaryCount;
	div.className = "secondaryChar";
	div.innerHTML = `
		<div name="player${i}secondary${secondaryCount}char" id="player${i}secondary${secondaryCount}char"></div>
		<div name="player${i}secondary${secondaryCount}alt" id="player${i}secondary${secondaryCount}alt"></div>
		<label for="player${i}secondary${secondaryCount}charImg">custom: </label>
		<input type="file" id="player${i}secondary${secondaryCount}charImg" name="player${i}secondary${secondaryCount}charImg" accept="image/*" onchange="imgChanged('player${i}secondary${secondaryCount}')">
		<button onclick="removeSecondaryChar(${i}, ${secondaryCount})">remove</button>
	`;
	document.getElementById("player" + i + "secondary").appendChild(div);

	var char = document.getElementById("player" + i + "secondary" + secondaryCount + "char");
	char.innerHTML = "";
	var game = document.getElementById('game').msDropdown.value;
	if (game != undefined) {
		var iconPackConfig = await (await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/config.json`)).json();
	}
	var pack = document.getElementById('pack').value;
	var ddJson = [];
	let obj = {};
	obj.value = "none";
	obj.text = "none";
	ddJson.push(obj);
	for (const [key, value] of Object.entries(gameConfig.character_to_codename)) {
		if (iconPackConfig != undefined) {
			if(json[game]["base_files/icon"][value.codename]) {
				let obj = {};
				obj.image = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${iconPackConfig.prefix}${value.codename}${iconPackConfig.postfix}${json[game]["base_files/icon"][value.codename][0]}`;
				obj.value = key;
				obj.text = key;
				ddJson.push(obj);
			}
		}
	}
	new MsDropdown(char, {
		byJson: {
			data: ddJson, selectedIndex: 0, name: "characters.id"
		},
		enableAutoFilter: true
	});
	char.msDropdown.on("close", function() {
		var secondaryCount = document.getElementById("player" + i + "secondary").childElementCount - 1;
		updateAlts(document.getElementById("player" + i + "secondary" + secondaryCount + "char").msDropdown.value, document.getElementById("player" + i + "secondary" + secondaryCount + "alt"));
		if (document.getElementById("player" + i + "secondary" + secondaryCount + "char").msDropdown.value != 'custom') {
			document.getElementById("player" + i + "secondary" + secondaryCount + "charImg").value = '';
			var customOption = document.getElementById("player" + i + "secondary" + secondaryCount + "char").msDropdown.namedItem('custom');
			if (customOption) {
				char.msDropdown.remove(customOption);
			}
		}
		try {
			saveFormState();
		} catch (e) {
			
		}
	});
	updateAlts(char.msDropdown.value, document.getElementById("player" + i + "secondary" + secondaryCount + "alt"));

	// var alt = document.getElementById("player" + i + "secondary" + secondaryCount + "alt");
	// alt.innerHTML = "";
	// var option = new Option("none", "none");
	// alt.appendChild(option);
	// var game = document.getElementById('game').value;
	// if(json[game][pack][char]) {
	// 	for (const [key, value] of Object.entries(json[game][pack][char])) {
	// 		var option = new Option(value, value);
	// 		alt.appendChild(option);
	// 	}
	// }
	try {
		saveFormState();
	} catch (e) {
		
	}
}

function removeSecondaryChar(i, j) {
	const secondaryContainer = document.getElementById("player" + i + "secondary");
	secondaryContainer.removeChild(document.getElementById("player" + i + "secondary" + j));

	// Reorder the remaining secondary character divs to ensure their ids are all sequential from 0
	for (let k = 0; k < secondaryContainer.childElementCount; k++) {
		const secondaryDiv = secondaryContainer.children[k];
		secondaryDiv.id = "player" + i + "secondary" + k;

		const charElement = secondaryDiv.querySelector(`[id^="player${i}secondary"][id$="char"]`);
		if (charElement) charElement.id = `player${i}secondary${k}char`;

		const altElement = secondaryDiv.querySelector(`[id^="player${i}secondary"][id$="alt"]`);
		if (altElement) altElement.id = `player${i}secondary${k}alt`;

		const charImgElement = secondaryDiv.querySelector(`[id^="player${i}secondary"][id$="charImg"]`);
		if (charImgElement) charImgElement.id = `player${i}secondary${k}charImg`;

		const buttonElement = secondaryDiv.querySelector(`button`);
		if (buttonElement) buttonElement.setAttribute("onclick", `removeSecondaryChar(${i}, ${k})`);
	}
	try {
		saveFormState();
	} catch (e) {
		
	}
}
async function updatePacks() {
	var game = document.getElementById('game').msDropdown.value;
	var pack = document.getElementById('pack');
	pack.innerHTML = "";

	if (json[game]) {
		for (let [key, value] of Object.entries(json[game])) {
			if(key == "smashgg_game_id" || key == "name") continue;
			let name = value["name"];
			if(key.includes("icon")) {
				name = "Icon Pack";
			}
			var option = new Option(name, key);
			pack.appendChild(option);
		}
	}
	if (game == "roa") {
		pack.value = "costume";
		document.getElementById('pixelyRendering').checked = true;
		document.getElementById('pixelyRendering').dispatchEvent(new Event('change'));
	} else if (game == "pplus") {
		pack.value = "portrait";
	} else if (game == "roa2") {
		pack.value = "costume";
	} else if (Array.from(pack.options).some(option => option.value === "full")) {
		pack.value = "full";
	} else {
		pack.value = pack.options[0].value;
	}
	updatePackInfo();
	await loadPackConfig();
	document.getElementById('pack').addEventListener('change', async function() {
		updatePackInfo();
		await loadPackConfig();
		for (let i = 1; i <= 8; i++) {
			updateAlts(document.getElementById("player" + i + "char").msDropdown.value, document.getElementById("player" + i + "alt"));
			for (let j = 0; j < document.getElementById("player" + i + "secondary").childElementCount; j++) {
				updateAlts(document.getElementById("player" + i + "secondary" + j + "char").msDropdown.value, document.getElementById("player" + i + "secondary" + j + "alt"));
			}
		}
		if (document.getElementById('game').msDropdown.value == "roa" && document.getElementById('pack').value == "costume") {
			document.getElementById('pixelyRendering').checked = true;
			document.getElementById('pixelyRendering').dispatchEvent(new Event('change'));
		} else {
			document.getElementById('pixelyRendering').checked = false;
			document.getElementById('pixelyRendering').dispatchEvent(new Event('change'));
		}
		try {
			saveFormState();
		} catch (e) {
			
		}
	});
	try {
		saveFormState();
	} catch (e) {
		
	}
}

var charsLoaded = false;

async function updateChars() {
	var game = document.getElementById('game').msDropdown.value;
	if (game != undefined) {
		var iconPackConfig = await (await fetch(`https://raw.githack.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/config.json`)).json();
	}
	for(let i = 1; i <= 8; i++) {
		for(let j = 0; j < document.getElementById("player" + i + "secondary").childElementCount; j++) {
			var char = document.getElementById("player" + i + "secondary" + j + "char");
			char.innerHTML = "";
			var game = document.getElementById('game').msDropdown.value;
			var ddJson = [];
			let obj = {};
			obj.value = "none";
			obj.text = "none";
			ddJson.push(obj);	
			for (const [key, value] of Object.entries(gameConfig.character_to_codename)) {
				if (iconPackConfig != undefined) {
					if(json[game]["base_files/icon"][value.codename]) {
						let obj = {};
						obj.image = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${iconPackConfig.prefix}${value.codename}${iconPackConfig.postfix}${json[game]["base_files/icon"][value.codename][0]}`;
						obj.value = key;
						obj.text = key;
						ddJson.push(obj);
					}
				}
			}
			new MsDropdown(char, {
				byJson: {
					data: ddJson, selectedIndex: 0, name: "characters.id"
				},
				enableAutoFilter: true
			});
		}
		if(currentGame == document.getElementById('game').msDropdown.value) continue;
		var char = document.getElementById("player" + i + "char");
		char.innerHTML = "";
		var ddJson = [];
		let obj = {};
		obj.value = "none";
		obj.text = "none";
		ddJson.push(obj);
		for (const [key, value] of Object.entries(gameConfig.character_to_codename)) {
			if (iconPackConfig != undefined) {
				if(json[game]["base_files/icon"][value.codename]) {
					let obj = {};
					obj.image = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/base_files/icon/${iconPackConfig.prefix}${value.codename}${iconPackConfig.postfix}${json[game]["base_files/icon"][value.codename][0]}`;
					obj.value = key;
					obj.text = key;
					ddJson.push(obj);
				}
			}
		}
		new MsDropdown(char, {
			byJson: {
				data: ddJson, selectedIndex: 0, name: "characters.id"
			},
			enableAutoFilter: true
		});
		char.msDropdown.on("close", function() {
			updateAlts(document.getElementById("player" + i + "char").msDropdown.value, document.getElementById("player" + i + "alt"));
			if (document.getElementById("player" + i + "char").msDropdown.value != 'custom') {
				document.getElementById("player" + i + "charImg").value = '';
				var customOption = document.getElementById("player" + i + "char").msDropdown.namedItem('custom');
				if (customOption) {
					document.getElementById("player" + i + "char").msDropdown.remove(customOption);
				}
			}
			try {
				saveFormState();
			} catch (e) {
				
			}
		});
		if (game == "roa") {
			if (!document.getElementById(`player${i}RoaRecolor`)) {
				var roaRecolor = document.createElement('input');
				roaRecolor.type = 'text';
				roaRecolor.placeholder = 'roa recolor code';
				roaRecolor.id = `player${i}RoaRecolor`;
				document.getElementById(`player${i}alt`).insertAdjacentElement('afterend', roaRecolor);
			}
		} else {
			var roaRecolor = document.getElementById(`player${i}RoaRecolor`);
			if (roaRecolor) {
				roaRecolor.remove();
			}
		}
		updateAlts(document.getElementById("player" + i + "char").msDropdown.value, document.getElementById("player" + i + "alt"));
	}
	charsLoaded = true;
	try {
		saveFormState();
	} catch (e) {
		
	}
}

var altsLoaded = false;

function updateAlts(char, alt) {
	console.log("updating alts", char, alt);
	alt.innerHTML = "";
	var game = document.getElementById('game').msDropdown.value;
	var pack = document.getElementById('pack').value;
	let codename = char
	if (gameConfig.character_to_codename[char]) {
		codename = gameConfig.character_to_codename[char].codename;
	}
	var ddJson = [];
	if(json[game][pack][codename]) {
		console.log(json[game][pack]);
		for (const [key, value] of Object.entries(json[game][pack][codename])) {
			let obj = {};
			obj.image = `https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/games/${game}/${pack}/${packConfig.prefix}${codename}${packConfig.postfix}${value}`;
			obj.value = value;
			let altMinusExt = value.split(".")[0];
			let altMinusExtNoNumPadding = altMinusExt.replace(/^0+/, '') || '0'; //turns 0000 into 0, 0001 into 1, etc
			obj.text = gameConfig.character_to_codename[char]?.skin_name?.[altMinusExtNoNumPadding]?.name || gameConfig.character_to_codename[char]?.skin_name?.[altMinusExt]?.name || altMinusExt;
			ddJson.push(obj);
		}
	}
	new MsDropdown(alt, {
		byJson: {
			data: ddJson, selectedIndex: 0, name: "alt.id"
		},
		enableAutoFilter: true
	});
	alt.msDropdown.on("close", function() {
		try {
			saveFormState();
		} catch (e) {
			
		}
	});
	if (alt.id == "player8alt") {
		altsLoaded = true;
	}
	try {
		saveFormState();
	} catch (e) {
		
	}
}

function sendToForm() {
	clearAll();
	var input = document.getElementById("startgglink").value.replace("events", "event");
	console.log(input.matchAll(startGGre), m => m[3]);

	eventData(Array.from(input.matchAll(startGGre), m => m[3])).then(async data => {
		console.log(data);
		document.getElementById("game").msDropdown.value = data["game"];
		document.getElementById("toptext").value = data["toptext"];
		if (data["toptext"].toLowerCase().includes("popoff")) {
			document.getElementById("pop-style").checked = true;
		} else if (data["toptext"].toLowerCase().includes("respawn") || data["toptext"].toLowerCase().includes("platform")) {
			document.getElementById("resplat-style").checked = true;
		} else {
			document.getElementById("ranbat-style").checked = true;
		}
		styleChanged();
		document.getElementById("bottomtext").value = data["bottomtext"];
		document.getElementById("url").value = data["url"];
		await loadGameConfig().then(async () => {
			updatePacks();
			await updateChars();
		});
		await loadPackConfig();
		document.getElementById('pixelyRendering').checked = false;
		document.getElementById('pixelyRendering').dispatchEvent(new Event('change'));

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

			if (player.chars) {
				var mainChar = player.chars[0][0];
				console.log(`Adding ${mainChar} character for player ${i + 1} with tag ${tag}`);
				if (gameConfig.character_to_codename[mainChar] == undefined) {
					for (const [key, value] of Object.entries(gameConfig.character_to_codename)) {
						if (value.smashgg_name === mainChar) {
							mainChar = key;
							break;
						}
						if (value.codename === mainChar) {
							mainChar = key;
							break;
						}
					}
				}
				document.getElementById(`player${i + 1}char`).msDropdown.value = mainChar;
				updateAlts(document.getElementById(`player${i + 1}char`).msDropdown.value, document.getElementById(`player${i + 1}alt`));
	
				if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[0][0]]) {
					document.getElementById(`player${i + 1}alt`).msDropdown.value = PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[0][0]];
				}
	
				// for (let j = 0; j < document.getElementById(`player${i + 1}secondary`).childElementCount; j++) {
				// 	removeSecondaryChar(i + 1, j);
				// }
	
				for (let j = 1; j < player.chars.length; j++) {
					var secondary = player.chars[j][0];
					for (const [key, value] of Object.entries(gameConfig.character_to_codename)) {
						if (value.smashgg_name === secondary) {
							secondary = key;
							break;
						}
						if (value.codename === secondary) {
							secondary = key;
							break;
						}
					}
					await addSecondaryChar(i + 1);
					document.getElementById(`player${i + 1}secondary${j - 1}char`).msDropdown.value = secondary;
					console.log(`Adding ${secondary} character for player ${i + 1} with tag ${tag}`);
	
					updateAlts(document.getElementById(`player${i + 1}secondary${j - 1}char`).msDropdown.value, document.getElementById(`player${i + 1}secondary${j - 1}alt`));
					if(PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[j][0]]) {
						document.getElementById(`player${i + 1}secondary${j - 1}alt`).msDropdown.value = PLAYER_OVERRIDES[tag]?.characters?.[data["game"]]?.[player.chars[j][0]];
					}
				}
			}
		}
	});
	try {
		saveFormState();
	} catch (e) {
		
	}
}

var triedToLoad = false;

document.addEventListener('DOMContentLoaded', function() {
	styleChanged();

	// disabling auto load for now as its annoying
	
	// const intervalId = setInterval(async () => {
	// 	if (gamesLoaded && charsLoaded && altsLoaded) {
	// 		clearInterval(intervalId);
	// 		await loadFormState();
	// 		triedToLoad = true;
	// 	}
	// }, 100); // Check every 100ms
});

function clearAll() {
	// document.getElementById("startgglink").value = "";
	document.getElementById("toptext").value = "";
	document.getElementById("bottomtext").value = "";
	document.getElementById("url").value = "";
	document.getElementById('backgroundImage').value = "";
	document.getElementById('logo').value = "";

	for (let i = 1; i <= 8; i++) {
		document.getElementById(`player${i}name`).value = "";
		document.getElementById(`player${i}twt`).value = "";
		document.getElementById(`player${i}char`).msDropdown.value = "none";
		updateAlts("none", document.getElementById(`player${i}alt`));
		document.getElementById(`player${i}charImg`).value = "";
		const roaRecolor = document.getElementById(`player${i}RoaRecolor`);
		if (roaRecolor) {
			roaRecolor.value = "";
		}
		const secondaryContainer = document.getElementById("player" + i + "secondary");
		for (let j = secondaryContainer.childElementCount - 1; j >= 0; j--) {
			removeSecondaryChar(i, j);
		}
	}
	try {
		saveFormState();
	} catch (e) {
		
	}
}

function saveFormState() {
	if (triedToLoad == false) return;

	const formState = {
		startgglink: document.getElementById("startgglink").value,
		toptext: document.getElementById("toptext").value,
		bottomtext: document.getElementById("bottomtext").value,
		url: document.getElementById("url").value,
		backgroundImage: document.getElementById("backgroundImage").value,
		logo: document.getElementById("logo").value,
		game: document.getElementById("game").msDropdown.value,
		pack: document.getElementById("pack").value,
		players: []
	};

	for (let i = 1; i <= 8; i++) {
		const player = {
			name: document.getElementById(`player${i}name`).value,
			twt: document.getElementById(`player${i}twt`).value,
			char: document.getElementById(`player${i}char`).msDropdown.value,
			alt: document.getElementById(`player${i}alt`).msDropdown.value,
			charImg: document.getElementById(`player${i}charImg`).value,
			secondary: []
		};

		const secondaryContainer = document.getElementById(`player${i}secondary`);
		for (let j = 0; j < secondaryContainer.childElementCount; j++) {
			const secondary = {
				char: document.getElementById(`player${i}secondary${j}char`).msDropdown.value,
				alt: document.getElementById(`player${i}secondary${j}alt`).msDropdown.value,
				charImg: document.getElementById(`player${i}secondary${j}charImg`).value
			};
			player.secondary.push(secondary);
		}

		formState.players.push(player);
	}

	localStorage.setItem('formState', JSON.stringify(formState));
}

async function loadFormState() {
	const formState = JSON.parse(localStorage.getItem('formState'));
	if (!formState) return;

	document.getElementById("startgglink").value = formState.startgglink;
	document.getElementById("toptext").value = formState.toptext;
	document.getElementById("bottomtext").value = formState.bottomtext;
	document.getElementById("url").value = formState.url;
	document.getElementById("backgroundImage").value = formState.backgroundImage;
	document.getElementById("logo").value = formState.logo;
	
	document.getElementById("game").msDropdown.value = formState.game;
	// document.getElementById('game').dispatchEvent(new Event('change'));

	await loadGameConfig().then(async () => {
		updatePacks();
		await updateChars();
	});

	document.getElementById("pack").value = formState.pack;
	// document.getElementById('pack').dispatchEvent(new Event('change'));
	
	updatePackInfo();
	await loadPackConfig();
	for (let i = 1; i <= 8; i++) {
		updateAlts(document.getElementById("player" + i + "char").msDropdown.value, document.getElementById("player" + i + "alt"));
		for (let j = 0; j < document.getElementById("player" + i + "secondary").childElementCount; j++) {
			updateAlts(document.getElementById("player" + i + "secondary" + j + "char").msDropdown.value, document.getElementById("player" + i + "secondary" + j + "alt"));
		}
	}
	
	formState.players.forEach((player, i) => {
		document.getElementById(`player${i + 1}name`).value = player.name;
		document.getElementById(`player${i + 1}twt`).value = player.twt;
		document.getElementById(`player${i + 1}char`).msDropdown.value = player.char;
		updateAlts(player.char, document.getElementById(`player${i + 1}alt`));
		document.getElementById(`player${i + 1}alt`).msDropdown.value = player.alt;
		document.getElementById(`player${i + 1}charImg`).value = player.charImg;

		player.secondary.forEach((secondary, j) => {
			addSecondaryChar(i + 1).then(() => {
				document.getElementById(`player${i + 1}secondary${j}char`).msDropdown.value = secondary.char;
				updateAlts(secondary.char, document.getElementById(`player${i + 1}secondary${j}alt`));
				document.getElementById(`player${i + 1}secondary${j}alt`).msDropdown.value = secondary.alt;
				document.getElementById(`player${i + 1}secondary${j}charImg`).value = secondary.charImg;
			});
		});
	});
}

document.querySelectorAll('input, select').forEach(element => {
	element.addEventListener('change', saveFormState);
});
document.querySelectorAll('input[type=file]').forEach(element => {
	element.addEventListener('input', saveFormState);
});