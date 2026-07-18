import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import SimpsonService from '../../simpson/service/SimpsonService';

export const data = new SlashCommandBuilder()
    .setName('randomsimpson')
    .setDescription('Recomienda un episodio aleatorio de Los Simpson');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        await interaction.deferReply();

        const episodio = await SimpsonService.getRandomEpisode();

        if (!episodio) {
            await interaction.editReply('❌ No se pudo obtener un episodio. Intenta nuevamente más tarde.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`📺 ${episodio.title}`)
            .setColor('Yellow')
            .setDescription((episodio as { summary?: string }).summary || 'Sin descripción disponible.')
            .addFields(
                { name: 'Temporada', value: String(episodio.season), inline: true },
                { name: 'Episodio', value: String(episodio.episode), inline: true }
            )
            .setFooter({ text: 'Fuente: simpsonsoptimizer.com' });

        const episodeData = episodio as { image?: string };
        if (episodeData.image) {
            embed.setImage(episodeData.image);
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('[randomsimpson] Error:', error);
        await interaction.editReply('❌ Ocurrió un error al obtener el episodio.');
    }
}

export default { data, execute };
