import { User, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js';

/**
 * Envía un mensaje directo (DM) a un usuario con componentes interactivos opcionales.
 * @param user - El usuario al que se enviará el DM.
 * @param messageContent - El contenido del mensaje.
 * @param components - Componentes interactivos opcionales (por ejemplo, botones).
 */
export async function sendSuccessDM(
    user: User,
    messageContent: string,
    components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = []
): Promise<void> {
    try {
        await user.send({
            content: messageContent,
            components: components,
        });
        console.log(`[DEBUG] DM enviado a ${user.tag}`);
    } catch (error: any) {
        console.error(`Error al enviar DM a ${user.tag}:`, error.message);
    }
}