const utilChistes = require('../util/readChistes');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('chiste')
		.setDescription('Sirve para contar chiste')
		.addStringOption(option =>
			option.setName('botenable')
				.setDescription('Toggle botEnable')
				.setRequired(false)
				.addChoices(
					{ name: 'Yes', value: 'ON' },
					{ name: 'No', value: 'OFF' },
				)),
	async execute(interaction) {

		const chiste = obtenerChiste();
		const embed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('El chiste de hoy')
			.setDescription(chiste)
			.setImage('https://render-us.worldofwarcraft.com/character/ragnaros/39/139444007-avatar.jpg?alt=wow/static/images/2d/avatar/4-1.jpg')
			.setFooter({ text: 'Bazinga!!!!!!' });

		interaction.reply({ embeds: [embed] });

		function obtenerChiste() {
			console.log('se esta ejecutando');
			const chistes = utilChistes.listaChistes;
			return chistes[Math.floor(Math.random() * chistes.length)];
		}

	},
};