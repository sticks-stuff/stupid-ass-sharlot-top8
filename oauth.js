const scopes = 'user.identity';
const REDIRECT_URI = 'http://127.0.0.1:5500/'
const CLIENT_ID = 69;
const CLIENT_SECRET = "8e1a8efc0d81a30239b408c60ebed4c9d06391060c380ced2c30ac52870c9e79";

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if(!code) {
	window.location.href = `https://start.gg/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; 
}

const data = {
	'client_id': CLIENT_ID,
	'client_secret': CLIENT_SECRET,
	'grant_type': 'authorization_code',
	'code': code,
	'redirect_uri': REDIRECT_URI,
	'scope': scopes
};
const headers = {
	'Content-Type': 'application/json',
};

var accessToken;

if(code) {
	fetch('https://corsproxy.io/?https://api.start.gg/oauth/access_token', { 
		method: 'POST',
		body: JSON.stringify(data),
		headers: headers
	}).then(res => res.json()).then(json => {
		accessToken = json.access_token;
		run();
	}).catch(e => {
		console.log(e);
	});
}