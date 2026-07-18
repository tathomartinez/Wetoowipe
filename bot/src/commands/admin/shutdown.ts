import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { isAuthorized } from '../../utils/permission';
import logger from '../../services/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Apaga el bot'),
    async execute(interaction: CommandInteraction): Promise<void> {
        if (!isAuthorized(interaction.user.id)) {
            await interaction.reply({ content: '⛔ No tienes permiso para usar este comando.', ephemeral: true });
            return;
        }
        try {
            await interaction.reply('Apagando el bot...');
            logger.info('>>> Apagando el servidor por comando /shutdown');
            process.exit(0);
        } catch (error) {
            logger.error('Error al intentar apagar el bot:', error);
            await interaction.reply('Hubo un error al intentar apagar el bot.');
        }
    },
};
