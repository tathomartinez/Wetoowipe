const { SlashCommandBuilder } = require('discord.js');
const Purga = require('../../services/messageCleaner.js');
const { isAuthorized } = require('../../util/permission');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('purga')
		.setDescription('Limpia mensajes'),
	async execute(interaction) {
		try {
			console.log('Execute eliminar mensajes');
			if (!isAuthorized(interaction.user.id)) {
				return interaction.reply({
					content: '⛔ No tienes permiso para usar este comando.',
					ephemeral: true,
				});
			}
			// if (!interaction.member.permissions.has('ManageMessages')) {
			// 	return interaction.reply({
			// 	  content: 'Necesitas permiso de ManageMessages para usar este comando.',
			// 	  ephemeral: true,
			// 	});
			//   }
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