const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
	],
});

client.commands = new Collection();

module.exports = client;
