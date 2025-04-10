const fs = require('node:fs');
const path = require('node:path');

module.exports = function loadCommands(client) {
	const commandsPath = path.join(__dirname, '../commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(path.join(commandsPath, file));
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.warn(`[WARNING] El comando ${file} no tiene 'data' o 'execute'.`);
		}
	}
};
