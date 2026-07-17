import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { deleteMessage } from '../../services/messageCleaner';
import { isAuthorized } from '../../utils/permission';

export const data = new SlashCommandBuilder()
    .setName('purga')
    .setDescription('Limpia mensajes');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        console.log('Execute eliminar mensajes');
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
        console.log('Termina eliminar mensajes');
    } catch (error) {
        console.log(error);
    }
}

export default { data, execute };
