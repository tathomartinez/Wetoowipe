const { SlashCommandBuilder } = require('discord.js');
const SimpsonService = require('../servicios/SimpsonService');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomsimpson')
		.setDescription('Muestra quien es el equipodev'),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			SimpsonService.getRandomEpisode().then(
				it => {
					console.log(it);
					interaction.editReply(`Hola
hoy te recomendamos el capitulo ${it.title}
La temporada ${it.season}
El capitulo : ${it.episode}`);
				},
			);
		} catch (error) {
			console.log(error);
		}
	},
};