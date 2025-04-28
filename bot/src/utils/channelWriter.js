async function sendMessageToChannel(client, channelId, message) {
    try {
        // Obtener el canal por su ID
        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            throw new Error('El canal no es válido o no es un canal de texto.');
        }

        // Enviar el mensaje al canal
        await channel.send(message);
        console.log(`Mensaje enviado al canal ${channelId}: ${message}`);
    } catch (error) {
        console.error(`Error al enviar mensaje al canal ${channelId}:`, error.message);
    }
}

module.exports = { sendMessageToChannel };