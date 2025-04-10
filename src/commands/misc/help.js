const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Muestra todos los comandos disponibles'),
	async execute(interaction) {
		const commands = interaction.client.commands;

		const embed = new EmbedBuilder()
			.setTitle('📖 Lista de comandos disponibles')
			.setColor('Blue')
			.setDescription('Aquí están los comandos que puedes usar:');

		commands.forEach(command => {
			embed.addFields({
				name: `/${command.data.name}`,
				value: command.data.description || 'Sin descripción',
			});
		});

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
