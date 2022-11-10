const utilChistes = require('../util/readChistes');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chiste')
		.setDescription('Sirve para contar chiste'),
	async execute(interaction) {

		const chistes = utilChistes.listaChistes;
		const chiste = chistes[Math.floor(Math.random() * chistes.length)];
		const embed = new EmbedBuilder()
			.setColor('Blue')
			.setTitle('El chiste de hoy')
			.setDescription(chiste)
			.setImage('https://render-us.worldofwarcraft.com/character/ragnaros/39/139444007-avatar.jpg?alt=wow/static/images/2d/avatar/4-1.jpg')
			.setFooter({ text: 'Bazinga!!!!!!' })
			;
		interaction.reply({ embeds: [embed] });

	},
};