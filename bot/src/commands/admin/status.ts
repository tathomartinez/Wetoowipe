import { SlashCommandBuilder, CommandInteraction, Message } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';
import logger from '../../services/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Da el estado del bot'),
    async execute(interaction: CommandInteraction): Promise<void> {
        try {
            await interaction.deferReply();
            await wait(2000);
            await interaction.editReply('Definitivo eres un puto');
            await interaction.followUp({ content: 'PREFIJOBOT' });
            const message: Message = await interaction.fetchReply();
            logger.debug('Status message:', message);
            await interaction.deleteReply();
        } catch (error) {
            logger.error('Error ejecutando el comando status:', error);
        }
    },
};
