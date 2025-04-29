import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import SimpsonService from '../../servicios/SimpsonService';
import logger from '../../services/logger';

const data = new SlashCommandBuilder()
    .setName('rs')
    .setDescription('Capítulo aleatorio de los Simpsons');

const execute = async (interaction: CommandInteraction) => {
    try {
        logger.debug(`Ejecutando el comando: ${interaction.commandName}`);
        await interaction.deferReply();

        const episode = await SimpsonService.getRandomEpisode();
		logger.debug(`Capítulo aleatorio: ${episode.title}`);
		logger.debug(episode);

        await interaction.editReply(`Hola
hoy te recomendamos el capítulo **${episode.title}**
Temporada: **${episode.season}**
Capítulo: **${episode.episode}**`);
    } catch (error) {
		logger.error(`Error al ejecutar el comando ${interaction.commandName}: ${error}`);
        await interaction.editReply('Ocurrió un error al obtener el capítulo. Por favor, inténtalo de nuevo más tarde.');
    }
};

export default { data, execute };