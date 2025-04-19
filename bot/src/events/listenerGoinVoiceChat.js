const { Events } = require('discord.js');
const { musicPlayer } = require('../core/musicPlayer'); // Importar la función musicPlayer
const AudioPaths = require('../audio/audioPaths'); // Importar el "enum"

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        try {
            // Salir si el usuario no se conectó a un canal de voz
            const botId = '868646244380192818'; // ID del bot
            if (newState.member.id === botId) {
                return;
            }

            if (oldState.channel || !newState.channel) {
                return;
            }

            console.log(`${newState.member.user.tag} se conectó al canal de voz: ${newState.channel.name}`);

            // Salir si no es el usuario específico
            // const specificUserId = '214877856994557952';
            // if (newState.member.id !== specificUserId) {
            //     return;
            // }

            console.log(`El usuario específico ${newState.member.user.tag} se conectó al canal de voz: ${newState.channel.name}`);

            // Ejecutar musicPlayer
            await musicPlayer({
                voiceChannel: newState.channel,
                guild: newState.guild,
                audioPath: AudioPaths.BIENVENIDO,
            });
        } catch (error) {
            console.error('Error en el evento VoiceStateUpdate:', error);
        }
    },
};