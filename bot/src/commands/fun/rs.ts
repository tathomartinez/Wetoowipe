import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import SimpsonService from '../../simpson/service/SimpsonService';
import logger from '../../services/logger';

const data = new SlashCommandBuilder()
    .setName('rs')
    .setDescription('Capítulo aleatorio de los Simpsons');

/**
 * Genera el mensaje de respuesta para un episodio.
 * @param episode Datos del episodio.
 * @returns Mensaje formateado.
 */
const generateEpisodeMessage = (episode: { title: string; season: number; episode: number }): string => {
    return `Hola
hoy te recomendamos el capítulo **${episode.title}**
Temporada: **${episode.season}**
Capítulo: **${episode.episode}**`;
};

const execute = async (interaction: CommandInteraction) => {
    try {
        logger.debug(`Ejecutando el comando: ${interaction.commandName}`);
        await interaction.deferReply();

        const episode = await SimpsonService.getRandomEpisode();

        if (!episode || !episode.title || !episode.season || !episode.episode) {
            throw new Error('Datos del episodio incompletos o inválidos');
        }

        logger.debug(`Capítulo aleatorio obtenido: ${JSON.stringify(episode)}`);
        const message = generateEpisodeMessage(episode);

        await interaction.editReply(message);
    } catch (error) {
        logger.error(`Error al ejecutar el comando ${interaction.commandName}: ${error}`);
        const errorMessage = 'Ocurrió un error al obtener el capítulo. Por favor, inténtalo de nuevo más tarde.';
        await interaction.editReply(errorMessage);
    }
};

export default { data, execute };