var query = 
`
query SetsQuery($slug: String) {
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
	  tournament { name city slug shortSlug}

	  standings(query: {
		page: 1
		perPage: 8
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
	
	  sets(page: 1, perPage: 999, sortType: RECENT) {
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
}
`

async function eventQuery(slug) {
	let response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${accessToken}`,
			Accept: "application/json",
		},
		body: JSON.stringify({
			query,
			variables: { slug },
		}),
	});
	let data = await response.json()
	return data;
}

async function eventData(slug) {
    const freq = {};
    freq["wins"] = {};
    const data = await eventQuery(slug);
	console.log(data);
    const eventData = data["data"];

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

		if(freq["wins"][name] == undefined) {
			players.push({
				"tag": name,
				"chars": Object.entries(freq[name]).sort((a, b) => b[1] - a[1]),
				"twitter": twi,
			});
		} else {
			players.push({
				"tag": name,
				"chars": Object.entries(freq["wins"][name]).sort((a, b) => b[1] - a[1]),
				"twitter": twi,
			});
		}
    }

    const event = eventData["event"];
    var displayGame = event["videogame"]["name"];
    var game = event["videogame"]["displayName"].toLowerCase();

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