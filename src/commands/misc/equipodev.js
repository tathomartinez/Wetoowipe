const { SlashCommandBuilder } = require('discord.js');
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('equipodev')
		.setDescription('Muestra quien es el equipodev'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			// await wait(2000);
			await interaction.editReply(`Obviamente yo soy <@250431644568125441> el equipodev PENDEJO`);
			// await interaction.followUp({ content: 'PREFIJOBOT' });
			// const message = await interaction.fetchReply();
			// console.log(message);
			// await interaction.deleteReply();
		} catch (error) {
			console.log(error);
		}
	},
};