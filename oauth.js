const scopes = 'user.identity';
const REDIRECT_URI = 'https://stupid-ass-sharlot-top8.pages.dev/';
const CLIENT_ID = 69;
const CLIENT_SECRET = "8e1a8efc0d81a30239b408c60ebed4c9d06391060c380ced2c30ac52870c9e79";
const TOKEN_URL = 'https://api.start.gg/oauth/access_token';
const REFRESH_URL = 'https://api.start.gg/oauth/refresh';

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; domain=stupid-ass-sharlot-top8.pages.dev; expires=${expires}; path=/`;
}

async function fetchToken(data) {
    const response = await fetch(`https://test-cors-proxy.stickman391.workers.dev/corsproxy/?apiurl=${TOKEN_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
}

async function refreshToken(refreshToken) {
    const data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
        'redirect_uri': REDIRECT_URI,
        'scope': scopes
    };
    return fetchToken(data);
}

async function requestAccessToken() {
    const data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'scope': scopes
    };
    const tokenResponse = await fetchToken(data);
	if (tokenResponse.access_token == undefined) {
		console.error(tokenResponse);
		return;
	}
    setCookie('access_token', tokenResponse.access_token, tokenResponse.expires_in / 86400);
    setCookie('refresh_token', tokenResponse.refresh_token, 30); // Assuming refresh token is valid for 30 days
    setCookie('expires_in', Date.now() + tokenResponse.expires_in * 1000, tokenResponse.expires_in / 86400);
    return tokenResponse.access_token;
}

async function getAccessToken() {
    let accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');
    const expiresIn = getCookie('expires_in');

    if (!accessToken && !code) {
        window.location.href = `https://start.gg/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    } else if (accessToken && Date.now() > expiresIn) {
        const tokenResponse = await refreshToken(refreshToken);
        accessToken = tokenResponse.access_token;
        setCookie('access_token', accessToken, tokenResponse.expires_in / 86400);
        setCookie('expires_in', Date.now() + tokenResponse.expires_in * 1000, tokenResponse.expires_in / 86400);
    } else if (!accessToken && code) {
        accessToken = await requestAccessToken();
    }

    return accessToken;
}
var accessToken;
(async () => {
	accessToken = await getAccessToken();
})();