import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnection, 
    AudioPlayer, 
    AudioResource 
} from '@discordjs/voice';
import { VoiceChannel, Guild } from 'discord.js';
import logger from '../services/logger';

type MusicPlayerOptions = {
    voiceChannel: VoiceChannel;
    guild: Guild;
    audioPath: string;
    onFinish?: () => void;
};

/**
 * Reproduce un archivo de audio en un canal de voz.
 * @param options Opciones para la reproducción.
 */
export async function musicPlayer({ voiceChannel, guild, audioPath, onFinish }: MusicPlayerOptions): Promise<void> {
    if (!voiceChannel) {
        throw new Error('El usuario no está en un canal de voz.');
    }

    // Conectarse al canal de voz
    const connection: VoiceConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator as any,
    });

    // Crear un reproductor de audio
    const player: AudioPlayer = createAudioPlayer();

    // Cargar un archivo de audio o una URL
    logger.debug('Cargando audio: ' + audioPath);
    const resource: AudioResource = createAudioResource(audioPath);

    // Conectar el reproductor al canal de voz
    connection.subscribe(player);

    // Reproducir el audio
    player.play(resource);

    // Manejar eventos del reproductor
    player.on(AudioPlayerStatus.Playing, () => {
        logger.info('Reproduciendo audio...');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        logger.info('Audio terminado.');
        connection.destroy(); // Desconectar del canal de voz
        if (onFinish) onFinish(); // Ejecutar callback si se proporciona
    });

    player.on('error', error => {
        logger.error('Error en el reproductor de audio: ' + error);
        connection.destroy(); // Desconectar del canal de voz en caso de error
    });
}