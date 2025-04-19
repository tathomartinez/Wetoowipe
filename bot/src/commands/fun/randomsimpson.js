const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SimpsonService = require('../../servicios/SimpsonService');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomsimpson')
		.setDescription('Recomienda un episodio aleatorio de Los Simpson'),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const episodio = await SimpsonService.getRandomEpisode();

			if (!episodio) {
				return interaction.editReply('❌ No se pudo obtener un episodio. Intenta nuevamente más tarde.');
			}

			const embed = new EmbedBuilder()
				.setTitle(`📺 ${episodio.title}`)
				.setColor('Yellow')
				.setDescription(episodio.summary || 'Sin descripción disponible.')
				.addFields(
					{ name: 'Temporada', value: String(episodio.season), inline: true },
					{ name: 'Episodio', value: String(episodio.episode), inline: true }
				)
				.setFooter({ text: 'Fuente: simpsonsoptimizer.com' });

			if (episodio.image) {
				embed.setImage(episodio.image);
			}

			await interaction.editReply({ embeds: [embed] });

		} catch (error) {
			console.error('[randomsimpson] Error:', error);
			await interaction.editReply('❌ Ocurrió un error al obtener el episodio.');
		}
	},
};
