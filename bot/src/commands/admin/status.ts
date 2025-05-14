import { SlashCommandBuilder, CommandInteraction, Message } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';

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
            console.log(message);
            await interaction.deleteReply();
        } catch (error) {
            console.error('Error ejecutando el comando status:', error);
        }
    },
};