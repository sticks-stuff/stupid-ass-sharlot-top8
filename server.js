const express = require('express')
const request = require('request');
const app = express()
const port = 3000
require("dotenv").config();

const scopes = 'user.identity';
const REDIRECT_URI = 'http://127.0.0.1:3000/oauth'
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_ID = "69";

app.get('/oauth_redirect', function (req, res) {
	res.redirect(`http://api.start.gg/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`)
});

app.get('/oauth', function (req, res) {
	const { query: { code } } = req;
	if (!code) {
		res.send({ 'error': 'OAuth login failed. Please restart flow. Error: missing code' });
		return;
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
	fetch('https://api.start.gg/oauth/access_token', { 
		method: 'POST',
		body: JSON.stringify(data),
		headers: headers
	}).then(res => res.json()).then(json => {
		res.redirect(`http://127.0.0.1:5500?access_token=${json.access_token}`)
	}).catch(e => {
		console.log(e);
		res.send('Error completing oauth login.')
	});
});

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});