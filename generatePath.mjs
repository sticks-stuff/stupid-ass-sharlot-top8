import fs from 'fs';
import fetch from 'node-fetch';

const GITHUB_API_URL = 'https://api.github.com/repos/joaorb64/StreamHelperAssets/git/trees/main?recursive=1';
const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/joaorb64/StreamHelperAssets/main/';
const LOCAL_GITHUB_API_FILE = 'github_api_response.json';
var finalJSON = {};

async function fetchFilesFromGitHub(retries = 10) {
    if (fs.existsSync(LOCAL_GITHUB_API_FILE)) {
        const data = JSON.parse(fs.readFileSync(LOCAL_GITHUB_API_FILE, 'utf8'));
        return data.tree.map(file => file.path);
    } else {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(GITHUB_API_URL, {
                    headers: {
                        'Accept': 'application/vnd.github+json'
                    }
                });
                const data = await response.json();
                fs.writeFileSync(LOCAL_GITHUB_API_FILE, JSON.stringify(data, null, 4));
                return data.tree.map(file => file.path);
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }
                console.error(`Attempt ${attempt} failed. Retrying...`);
            }
        }
    }
}

async function fetchJsonFromUrl(url) {
    const response = await fetch(url);
    return response.json();
}

(async () => {
    const files = await fetchFilesFromGitHub();
    const assets = await fetchJsonFromUrl(`${RAW_GITHUB_URL}assets.json`);

    await Promise.all(Object.entries(assets).map(async (game) => {
        if (!finalJSON[game[0]]) {
            finalJSON[game[0]] = {};
            console.log("new game " + game[0]);
        }
        let configUrl = `${RAW_GITHUB_URL}games/${game[0]}/base_files/config.json`;
        const config = await fetchJsonFromUrl(configUrl);
        finalJSON[game[0]]["smashgg_game_id"] = config.smashgg_game_id;
        finalJSON[game[0]]["name"] = config.name;
        await Promise.all(Object.entries(game[1].assets).map(async (pack) => {
            try {
                if (pack[0] == "base_files") {
                    pack[0] = "base_files/icon";
                }
                let configUrl = `${RAW_GITHUB_URL}games/${game[0]}/${pack[0]}/config.json`;

                const config = await fetchJsonFromUrl(configUrl);
                if (config["type"] && config["type"][0] == "stage_icon") {
                    return;
                }

                const packFiles = files.filter(file => file.startsWith(`games/${game[0]}/${pack[0]}`));
                const filteredFiles = packFiles
                    .map(file => file.split('/').pop())
                    .map(file => file.replace(new RegExp(config.prefix, 'g'), ''))
                    .filter(file => file !== 'README.md' && file !== 'config.json' && file.includes('.'))

                filteredFiles.forEach(file => {
                    pack[0] = pack[0].replace("base_files/icon", "icon");

                    if (!finalJSON[game[0]][pack[0]]) {
                        finalJSON[game[0]][pack[0]] = {};
                        console.log("new pack " + pack[0]);
                    }
                    const char_name = file.split(config.postfix).slice(0, -1).join(config.postfix);
                    if (!finalJSON[game[0]][pack[0]][char_name]) {
                        finalJSON[game[0]][pack[0]][char_name] = [];
                        console.log("new char " + char_name);
                    }
                    finalJSON[game[0]][pack[0]][char_name].push(file.split(config.postfix).pop());
                });
            } catch (error) {
                console.error(`Error processing game: ${game[0]}, pack: ${pack[0]}`, error);
            }
            console.log(finalJSON[game[0]]);
            console.log(game[0]);
        }));
    }));

    fs.writeFile('paths.json', JSON.stringify(finalJSON, null, 4), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
})();