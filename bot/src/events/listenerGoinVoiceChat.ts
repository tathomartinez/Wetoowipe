import { Events, VoiceState, Guild, VoiceChannel } from 'discord.js';
import { musicPlayer } from '../core/musicPlayer';
import { AudioPaths } from '../audio/audioPaths';
import logger from '../services/logger';
import { logVoiceConnection } from '../services/voiceLogService';

export default {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        try {
            const botId = process.env.BOT_ID;
            if (newState.member?.id === botId) {
                return;
            }

            const userId = newState.member?.id || oldState.member?.id;
            const guildId = newState.guild.id || oldState.guild.id;

            if (!oldState.channel && newState.channel) {
                logger.debug(`Estado de voz actualizado: ${newState.member?.user.tag} se unió al canal ${newState.channel.name}`);

                await logVoiceConnection(userId!, newState.channel.id, guildId, 'join');

                await musicPlayer({
                    voiceChannel: newState.channel as VoiceChannel,
                    guild: newState.guild as Guild,
                    audioPath: AudioPaths.BIENVENIDO,
                });
            } else if (oldState.channel && !newState.channel) {
                logger.debug(`${oldState.member?.user.tag} se desconectó del canal ${oldState.channel.name}`);

                await logVoiceConnection(userId!, oldState.channel.id, guildId, 'leave');
            }
        } catch (error) {
            logger.debug('Error en el evento VoiceStateUpdate:', error);
        }
    },
};
