import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import SimpsonService from '../../servicios/SimpsonService';
import logger from '../../services/logger';

export const data = new SlashCommandBuilder()
  .setName('rs')
  .setDescription('Capítulo aleatorio de los Simpsons');

export const execute = async (interaction: CommandInteraction) => {
  try {
	logger.debug(`Ejecutando el comando: ${interaction.commandName}`);
    await interaction.deferReply();

    const episode = await SimpsonService.getRandomEpisode();
    console.log(episode);

    await interaction.editReply(`Hola
hoy te recomendamos el capítulo **${episode.title}**
Temporada: **${episode.season}**
Capítulo: **${episode.episode}**`);
  } catch (error) {
    console.error(error);
    await interaction.editReply('Ocurrió un error al obtener el capítulo. Por favor, inténtalo de nuevo más tarde.');
  }
};
