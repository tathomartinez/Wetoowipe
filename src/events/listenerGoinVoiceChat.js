const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute(oldState, newState) {
        // console.log('Evento VoiceStateUpdate disparado');

        // Verificar si el usuario se conectó a un canal de voz
        if (!oldState.channel && newState.channel) {
            // console.log(`${newState.member.user.tag} se conectó al canal de voz: ${newState.channel.name}`);
            // console.log(`${newState.member.user} se conectó al canal de voz: ${newState.channel.name}`);

            // Verificar si es un usuario específico
            // const specificUserId = '250431644568125441';
            const specificUserId = '214877856994557952';
            if (newState.member.id === specificUserId) {
                console.log(`${newState.member.user} se conectó al canal de voz: ${newState.channel.name}`);
                newState.member.user.send(`¡Pinche negro <3 ${newState.channel.name}! 🎤`)
                    .then(() => {
                        console.log(`Mensaje directo enviado a ${newState.member.user.tag}`);
                    })
                    .catch(error => {
                        console.error(`No se pudo enviar el mensaje directo a ${newState.member.user.tag}:`, error);
                    });
            }
        }
    },
};