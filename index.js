const scopes = 'user.identity';
const redirect_uri = 'http://127.0.0.1:3000/oauth'
const CLIENT_ID = 69;

const urlParams = new URLSearchParams(window.location.search);
const access_token = urlParams.get('access_token');
if(!access_token) {
	window.open(`https://start.gg/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirect_uri)}`)
} else {
	var query = 
	`
	query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {
		event(id: $eventId) {
		  id
		  name
		  standings(query: {
			perPage: $perPage,
			page: $page
		  }){
			nodes {
			  placement
			  entrant {
				id
				name
			  }
			}
		  }
		}
	  }
	`

	var eventId = 78790;
	var page = 1;
	var perPage = 3;
	  
	fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${access_token}`,
			Accept: "application/json",
		},
		body: JSON.stringify({
			query,
			variables: { eventId, page, perPage },
		}),
	})
	.then(r => r.json())
	.then(data => console.log("data returned:", data))
}