/*

		**************************************************************
		THIS IS RUN THROUGH NODE TO GENERATE "alts.json" AT BUILD TIME
		**************************************************************

*/

const { resolve } = require('path');
var path = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs');
const assets = require('./StreamHelperAssets/assets.json');

var finalJSON = {};

async function getFiles(dir) {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = resolve(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files).map(file => path.basename(file));
}
// console.log(assets);
(async () => {
	await Promise.all(Object.entries(assets).map(async (game) => {
		if (!finalJSON[game[0]]) {
			finalJSON[game[0]] = {};
			console.log("new game " + game[0]);
		}
		await Promise.all(Object.entries(game[1].assets).map(async (pack) => {
			try {
				if (pack[0] == "base_files") {
					const config = JSON.parse(fs.readFileSync(`./StreamHelperAssets/${game[0]}/${pack[0]}/config.json`, 'utf8'));
					finalJSON[game[0]]["smashgg_game_id"] = config.smashgg_game_id;
					finalJSON[game[0]]["name"] = config.name;
					pack[0] = "base_files/icon";
				}
				const config = JSON.parse(fs.readFileSync(`./StreamHelperAssets/${game[0]}/${pack[0]}/config.json`, 'utf8'));
				var files = await getFiles(`./StreamHelperAssets/${game[0]}/${pack[0]}`);

				files = files.map(file => file.replace(new RegExp(config.prefix, 'g'), ''));
				files = files.filter(file => file !== 'README.md');
				files = files.filter(file => file !== 'config.json');

				files.forEach(file => {
					pack[0] = pack[0].replace("base_files/icon", "icon");

					if (!finalJSON[game[0]][pack[0]]) {
						finalJSON[game[0]][pack[0]] = {};
						console.log("new pack " + pack[0]);
					}
					char_name = file.split(config.postfix)[0];
					if (!finalJSON[game[0]][pack[0]][char_name]) {
						finalJSON[game[0]][pack[0]][char_name] = [];
						console.log("new char " + char_name);
					}
					finalJSON[game[0]][pack[0]][char_name].push(file.split(config.postfix)[1]);
				});
			} catch (error) {
				// console.error(`Error processing game: ${game[0]}, pack: ${pack[0]}`, error);
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