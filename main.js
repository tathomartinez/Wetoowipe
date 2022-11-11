const { Client, Collection, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent],
});
const fs = require('node:fs');
const path = require('node:path');
const managerInterval = require('./src/util/ManagerInterval');
const { token, channelJoke } = require('./config.json');
const { request } = require('undici');

const timewait = Number(30 * 60000);
// (n*60000) donde n son los minutos y se transforman en ms

// const timewait = Number(1 * 30000); // (n*60000) donde n son los minutos y se transforman en ms

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
	console.log('Se inicia proceso de chistes');
	const interval = setInterval(() => { imprimirChiste(client); }, timewait);
	managerInterval.map.set('chistes', interval);
	console.log('Se finaliza proceso de chistes');
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
	const channel = _client.channels.cache.get(channelJoke);
	// const channel = _client.channels.cache.get('868651189200379966');
	const file = new AttachmentBuilder('./assets/chuck.jpg');

	obtenerChiste().then(it => {
		const embed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('El chiste de hoy')
			.setDescription(it)
			.setImage('attachment://chuck.jpg')
			.setFooter({ text: 'Bazinga!!!!!!' });

		channel.send({ embeds: [embed], files: [file] });
	});

}
async function obtenerChiste() {
	const catResult = await request('https://api.chucknorris.io/jokes/random');
	const { value } = await catResult.body.json();
	return value;
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

// client.login(process.env.TOKEN);
client.login(token);