/*

		**************************************************************
		THIS IS RUN THROUGH NODE TO GENERATE "alts.json" AT BUILD TIME
		**************************************************************

*/

const { resolve } = require('path');
var path = require('path');
const { readdir } = require('fs').promises;
const fs = require('fs');

async function getFiles(dir) {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = resolve(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
}

var finalJSON = {};

getFiles("assets/").then(e => {
	for (let i = 0; i < e.length; i++) {
		var element = e[i];
		element = path.relative('/', element);
		element = element.replaceAll('\\', '/');
		element = element.split("stupid-ass-sharlot-top8/assets/")[1];
		element = element.split("/");
		if(element.length <= 1) continue;
		if(element[1] != "renders") continue;
		var char = element[2].split("-")[0];
		var altName = element[2].split("-")[1];
		if(altName == undefined) {
			console.error(element)
		}
		altName = altName.split(".png")[0];
		
		if(!(element[0] in finalJSON)) {
			finalJSON[element[0]] = {};
			console.log("new game " + element[0]);
		}
		if(!(char in finalJSON[element[0]])) {
			finalJSON[element[0]][char] = [];
			console.log("new char " + char);
		}
		finalJSON[element[0]][char].push(altName);
		// console.log(finalJSON[element[0]][char]);
	}
	// console.log(JSON.stringify(finalJSON));
	fs.writeFile('alts.json', JSON.stringify(finalJSON, null, 4), (err) => {
		if (err) throw err;
		console.log('Data written to file');
	});
});
