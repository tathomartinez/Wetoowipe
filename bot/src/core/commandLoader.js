const fs = require('node:fs');
const path = require('node:path');

function loadCommands(client) {
	const commandsPath = path.join(__dirname, '../commands');
	loadRecursively(commandsPath, client);
}

function loadRecursively(dir, client) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			loadRecursively(fullPath, client);
		} else if (file.endsWith('.js')) {
			const command = require(fullPath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.warn(`[WARNING] El comando ${file} no tiene 'data' o 'execute'.`);
			}
		}
	}
}

module.exports = loadCommands;
