const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const fs = require('node:fs');
const path = require('node:path');
// const timewait = Number(20 * 60000) // (n*60000) donde n son los minutos y se transforman en ms

client.commands = new Collection();

const commandsPath = path.join(__dirname, '/src/commands');

const eventsPath = path.join(__dirname, '/src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

init();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	console.log(interaction);
	console.log(interaction.client);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

function init() {
	resolverCommandFiles();
	resolverEventsFile();
}

function resolverCommandFiles() {
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

function resolverEventsFile() {
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

client.login(token);