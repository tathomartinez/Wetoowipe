import { Events, VoiceState, Guild, VoiceChannel } from 'discord.js';
import { musicPlayer } from '../core/musicPlayer'; // Importar la función musicPlayer
import AudioPaths from '../audio/audioPaths'; // Importar el "enum"
import logger from '../services/logger';

export default {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        try {
            // Salir si el usuario no se conectó a un canal de voz
            const botId = process.env.BOT_ID; // ID del bot
            if (newState.member?.id === botId) {
                return;
            }

            if (oldState.channel || !newState.channel) {
                return;
            }
            logger.debug(`Estado de voz actualizado: ${newState.member?.user.tag} se unió al canal ${newState.channel.name}`);

            logger.debug(`${newState.member?.user.tag} se unió al canal de voz: ${newState.channel.name}`);

            logger.debug(`El usuario específico ${newState.member?.user.tag} se conectó al canal de voz: ${newState.channel.name}`);
            // Ejecutar musicPlayer
            await musicPlayer({
                voiceChannel: newState.channel as VoiceChannel,
                guild: newState.guild as Guild,
                audioPath: AudioPaths.BIENVENIDO,
            });
        } catch (error) {
            logger.debug('Error en el evento VoiceStateUpdate:', error);
        }
    },
};