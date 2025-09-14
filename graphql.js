
// Query for event info and standings (run once)
const eventInfoQuery = `
query EventInfo($slug: String) {
	event(slug: $slug) {
		id
		name
		numEntrants
		state
		startAt
		videogame {
			id
			name
			displayName
		}
		tournament { name city slug shortSlug }
		standings(query: {
			page: 1
			perPage: 20
			sortBy: "standing"
		}){
			nodes{
				placement
				entrant{
					name
					participants {
						user {
							authorizations(types:TWITTER) {
								externalUsername
							}
						}
					}
				}
			}
		}
	}
}`;

// Query for sets only (paginated)
const setsQuery = `
query SetsQuery($slug: String, $page: Int, $perPage: Int) {
	event(slug: $slug) {
		sets(page: $page, perPage: $perPage, sortType: RECENT) {
			pageInfo {
				total
				totalPages
				page
				perPage
				sortBy
				filter
			}
			nodes {
				games {
					winnerId
					selections {
						entrant {
							name
							id
						}
						selectionValue
						character {
							name
						}
					}
				}
			}
		}
	}
}`;



async function eventInfoQueryFetch(slug) {
	let response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`,
			Accept: "application/json",
		},
		body: JSON.stringify({
			query: eventInfoQuery,
			variables: { slug: `${slug}` },
		}),
	});
	let data = await response.json();
	return data;
}

async function setsQueryFetch(slug, page, perPage = 40) {
	let response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`,
			Accept: "application/json",
		},
		body: JSON.stringify({
			query: setsQuery,
			variables: { slug: `${slug}`, page, perPage },
		}),
	});
	let data = await response.json();
	return data;
}




async function eventData(slug) {
	const fetchJson = await fetch('paths.json');
	const paths = await fetchJson.json();
	console.log(slug)
	const freq = {};
	freq["wins"] = {};

	// 1. Fetch event info and standings (once)
	const eventInfoData = await eventInfoQueryFetch(slug);
	if (!eventInfoData || !eventInfoData.data || !eventInfoData.data.event) {
		throw new Error("Event info not found");
	}
	const eventData = eventInfoData.data;

	// 2. Fetch sets (paginated, with error handling)
	async function fetchAllSets(slug, perPage) {
		let page = 1;
		let allSetNodes = [];
		let totalPages = 1;
		let errorDetected = false;
		do {
			let data = await setsQueryFetch(slug, page, perPage);
			//console.log(`Fetched page ${page} with perPage=${perPage}`);
			//console.log(data);
			// Detect complexity error
			if (data && data.errors && Array.isArray(data.errors)) {
				const complexityError = data.errors.find(e => e.message && e.message.includes("complexity"));
				if (complexityError) {
					errorDetected = true;
					break;
				}
			}
			const setsPageInfo = data["data"] && data["data"]["event"] && data["data"]["event"]["sets"] ? data["data"]["event"]["sets"]["pageInfo"] : null;
			if (setsPageInfo && setsPageInfo.totalPages) {
				totalPages = setsPageInfo.totalPages;
			}
			const nodes = data["data"] && data["data"]["event"] && data["data"]["event"]["sets"] && data["data"]["event"]["sets"]["nodes"] ? data["data"]["event"]["sets"]["nodes"] : [];
			allSetNodes = allSetNodes.concat(nodes);
			page++;
		} while (page <= totalPages);
		return { allSetNodes, errorDetected };
	}

	let perPage = 40;
	let setsResult;
	do {
		setsResult = await fetchAllSets(slug, perPage);
		if (setsResult.errorDetected) {
			if (perPage > 10) {
				perPage = Math.max(10, Math.floor(perPage / 2));
				console.warn(`Query complexity error detected, retrying with perPage=${perPage}`);
			} else {
				throw new Error("Query complexity error persists even at perPage=10");
			}
		}
	} while (setsResult.errorDetected);

	// Attach all sets to eventData for downstream logic
	if (eventData && eventData["event"]) {
		if (!eventData["event"]["sets"]) eventData["event"]["sets"] = {};
		eventData["event"]["sets"]["nodes"] = setsResult.allSetNodes;
	}

	try {
		if (eventData["event"] === null) return null;

		for (const node of eventData["event"]["sets"]['nodes']) {
			if (node["games"] === null) continue;

			for (const game of node["games"]) {
				if (game["selections"]) {
					for (const selection of game["selections"]) {
						const player = selection["entrant"]["name"];
						const char = selection["character"]["name"];

						if(game["winnerId"] == selection["entrant"]["id"]) {
							if (player in freq["wins"]) {
								if (char in freq["wins"][player]) {
									freq["wins"][player][char] += 1;
								} else {
									freq["wins"][player][char] = 1;
								}
							} else {
								freq["wins"][player] = { [char]: 1 };
							}
						} else {
							if (player in freq) {
								if (char in freq[player]) {
									freq[player][char] += 1;
								} else {
									freq[player][char] = 1;
								}
							} else {
								freq[player] = { [char]: 1 };
							}
						}
					}
				}
			}
		}
	} catch (error) {
		console.error(error);
	}

	const players = [];
	for (const p of eventData["event"]["standings"]["nodes"]) {
		const name = p["entrant"]["name"];

		let twi = null;
		const P = p["entrant"]["participants"];
		if (P.length === 1) {
			if (P[0]["user"] && P[0]["user"]["authorizations"]) {
				twi = "@" + P[0]["user"]["authorizations"][0]["externalUsername"];
			}
		}

		var player = {};
		player["tag"] = name;
		player["twitter"] = twi;

		if(freq["wins"][name] == undefined && freq[name]) {
			player["chars"] = Object.entries(freq[name]).sort((a, b) => b[1] - a[1]);
		} else if (freq["wins"][name]) {
			player["chars"] = Object.entries(freq["wins"][name]).sort((a, b) => b[1] - a[1]);
		}

		players.push(player);
	}

	const event = eventData["event"];
	var displayGame = event["videogame"]["name"];
	var game = event["videogame"]["id"];

	const matchingGame = Object.values(paths).find(path => {
		if (typeof path.smashgg_game_id === 'number') {
			return path.smashgg_game_id === game;
		} else if (Array.isArray(path.smashgg_game_id)) {
			return path.smashgg_game_id.includes(game);
		}
		return false;
	});

	if (matchingGame) {
		game = Object.keys(paths).find(key => paths[key] === matchingGame);
	}

	const btext = [];
	if (event["startAt"]) {
		const fecha = new Date(event["startAt"] * 1000).toLocaleDateString();
		btext.push(fecha);
	}
	if (event["tournament"]["city"]) {
		const ciudad = event["tournament"]["city"];
		btext.push(ciudad);
	}
	btext.push(event["numEntrants"] + " Participants");
	const btextResult = btext.join(" - ");

	const ttext = event["tournament"]["name"].split(" - ")[0] + " - " + displayGame;

	const link = event["tournament"]["shortSlug"] ? `https://start.gg/${event["tournament"]["shortSlug"]}` : `start.gg/${event["tournament"]["slug"]}`;

	const finalData = {
		"players": players,
		"toptext": ttext,
		"bottomtext": btextResult,
		"url": link,
		"game": game
	};

	return finalData;
}