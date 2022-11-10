const fs = require('fs');
const readline = require('readline');

const chistes = [];

const readInterface = readline.createInterface({
	input: fs.createReadStream('./src/data/chistes.txt'),
	console: false,
});

readInterface.on('line', line => {
	chistes.push(line);
});

module.exports = {
	name: 'chistes',
	description: 'chistes',
	listaChistes: chistes,
};