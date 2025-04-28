async function sendMessageToChannel(client, channelId, message) {
    try {
        console.log(`Buscando el canal con ID: ${channelId}`);
        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            throw new Error('El canal no es válido o no es un canal de texto.');
        }

        console.log(`Enviando mensaje al canal: ${channelId}`);
        const sentMessage = await channel.send(message);
        console.log(`Mensaje enviado al canal ${channelId}: ${sentMessage.content}`);
        return sentMessage; // Devolver el mensaje enviado
    } catch (error) {
        console.error(`Error al enviar mensaje al canal ${channelId}:`, error.message);
        throw error;
    }
}

module.exports = { sendMessageToChannel };