const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const fs = require('node:fs');
const path = require('node:path');
const utilChistes = require('./src/util/readChistes');
const managerInterval = require('./src/util/ManagerInterval');

const timewait = Number(20 * 60000) // (n*60000) donde n son los minutos y se transforman en ms

client.commands = new Collection();

const commandsPath = path.join(__dirname, '/src/commands');
const eventsPath = path.join(__dirname, '/src/events');

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

init();

function init() {
	resolverCommandFiles();
	resolverEventsFile();
	iniciarChistes();
}

function iniciarChistes() {
	const isEnabled = true;
	let interval;
	if (isEnabled) {
		interval = setInterval(() => { imprimirChiste(client); }, timewait);
		managerInterval.map.set('chistes', interval);
	} else {
		interval = managerInterval.map.get('chistes');
		clearInterval(interval);
	}
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

function imprimirChiste(_client) {
	const channel = _client.channels.cache.find(ch => ch.name === 'chistes bot');
	channel.send(obtenerChiste());
}

function obtenerChiste() {
	const chistes = utilChistes.listaChistes;
	return chistes[Math.floor(Math.random() * chistes.length)];
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