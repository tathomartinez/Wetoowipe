import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { deleteMessage } from '../../services/messageCleaner';
import { isAuthorized } from '../../utils/permission';
import logger from '../../services/logger';

export const data = new SlashCommandBuilder()
    .setName('purga')
    .setDescription('Limpia mensajes');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        logger.debug('Execute eliminar mensajes');
        if (!isAuthorized(interaction.user.id)) {
            await interaction.reply({
                content: '⛔ No tienes permiso para usar este comando.',
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();
        const channel = interaction.client.channels.cache.get(interaction.channelId) as TextChannel;
        deleteMessage(channel, interaction.client);
        logger.debug('Termina eliminar mensajes');
    } catch (error) {
        logger.error('Error en comando purga:', error);
    }
}

export default { data, execute };
