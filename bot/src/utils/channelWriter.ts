import { Client, TextBasedChannel, Message } from 'discord.js';

/**
 * Envía un mensaje a un canal de texto basado en su ID.
 * @param client - Cliente de Discord.
 * @param channelId - ID del canal al que se enviará el mensaje.
 * @param message - Contenido del mensaje a enviar.
 * @returns El mensaje enviado.
 */
export async function sendMessageToChannel(
    client: Client,
    channelId: string,
    message: string
): Promise<Message> {
    try {
        console.log(`Buscando el canal con ID: ${channelId}`);
        const channel = await client.channels.fetch(channelId);

        if (!channel || !channel.isTextBased() || !('send' in channel)) {
            throw new Error('El canal no es válido o no es un canal de texto con capacidad de enviar mensajes.');
        }

        console.log(`Enviando mensaje al canal: ${channelId}`);
        const sentMessage = await channel.send(message);
        console.log(`Mensaje enviado al canal ${channelId}: ${sentMessage.content}`);
        return sentMessage; // Devolver el mensaje enviado
    } catch (error: any) {
        console.error(`Error al enviar mensaje al canal ${channelId}:`, error.message);
        throw error;
    }
}