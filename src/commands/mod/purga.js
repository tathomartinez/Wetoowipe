const { SlashCommandBuilder } = require('discord.js');
const Purga = require('../../chistes/Purga');
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purga')
		.setDescription('Limpia mensajes'),
	async execute(interaction) {
		try {
			console.log('Execute eliminar mensajes');
			await interaction.deferReply();
			// console.log(interaction);
			const { channelId } = interaction;
			// console.log(channelId);
			// console.log(interaction.client);
			const channel = interaction.client.channels.cache.get(channelId);
			// console.log(channel);
			// console.log(channel.messages);
			Purga.deleteMessage(channel, interaction.client);
			console.log('Termina eliminar mensajes');
		} catch (error) {
			console.log(error);
		}
	},
};