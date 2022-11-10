const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Da el status de el bot'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			// await interaction.reply({ content: 'buscando respuesta', ephemeral: true });
			await wait(2000);
			await interaction.editReply('Definitivo eres un puto');
			await interaction.followUp({ content: 'PREFIJOBOT' });
			const message = await interaction.fetchReply();
			console.log(message);
			await interaction.deleteReply();
		} catch (error) {
			console.log(error);
		}
		// await interaction.reply({ content: 'buscando respuesta', ephemeral: true });
		// await wait(200);
		// await interaction.editReply('Definitivo eres un puto');
	},
};