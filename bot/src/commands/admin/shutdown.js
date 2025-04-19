const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Saluda'),
	async execute(interaction) {
		// message.channel.send('WORKING!!!...').then(console.log(">>> Apagando el servidor")).then(
		// process.exit(1))
	},
};