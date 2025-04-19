const fs = require('fs');
const path = require('path');

const chistesPath = path.join(__dirname, './chistes.txt');

// Leemos todo de una
const contenido = fs.readFileSync(chistesPath, 'utf-8');

// Lo separamos por líneas
const chistes = contenido.split('\n').filter(line => line.trim().length > 0);

module.exports = {
	listaChistes: chistes,
	getJokes: () => chistes,
};