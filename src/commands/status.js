const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Da el status de el bot'),
	async execute(interaction) {
		await interaction.reply('nice');
	},
};