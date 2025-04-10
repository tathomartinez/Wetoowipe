require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];

const commandsPath = path.join(__dirname, 'src', 'commands');

function readCommands(dir) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			readCommands(fullPath);
		} else if (file.endsWith('.js')) {
			const command = require(fullPath);
			if (command?.data?.toJSON) {
				commands.push(command.data.toJSON());
			} else {
				console.warn(`[WARNING] Skipped ${file} - missing .data.toJSON()`);
			}
		}
	}
}

readCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
	try {
		console.log(`[DEPLOY] Subiendo ${commands.length} comandos a Discord...`);

		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`[DEPLOY] Completado con ${data.length} comandos registrados.`);
	} catch (error) {
		console.error('[DEPLOY] Error al registrar comandos:', error);
	}
})();
