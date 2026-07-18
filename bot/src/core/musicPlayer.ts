import { spawn } from 'child_process';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnection,
    AudioPlayer,
    AudioResource,
    StreamType,
    entersState,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceChannel, Guild } from 'discord.js';
import logger from '../services/logger';

type MusicPlayerOptions = {
    voiceChannel: VoiceChannel;
    guild: Guild;
    audioPath: string;
    onFinish?: () => void;
};

const activeConnections = new Map<string, VoiceConnection>();

export async function musicPlayer({ voiceChannel, guild, audioPath, onFinish }: MusicPlayerOptions): Promise<void> {
    if (!voiceChannel) {
        throw new Error('El usuario no está en un canal de voz.');
    }

    const guildId = guild.id;

    const connection: VoiceConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: guild.voiceAdapterCreator as any,
        selfDeaf: true,
    });

    connection.on('stateChange', (oldState: any, newState: any) => {
        logger.debug(`[VoiceConnection] ${oldState.status} -> ${newState.status}`);
    });

    logger.debug('Esperando conexión Ready...');
    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
    } catch {
        logger.error('[VoiceConnection] No se pudo conectar al canal de voz en 10s');
        connection.destroy();
        return;
    }
    logger.debug('[VoiceConnection] Conexión establecida en Ready');

    const player: AudioPlayer = createAudioPlayer();

    logger.debug('Cargando audio: ' + audioPath);
    const ffmpeg = spawn('ffmpeg', [
        '-i', audioPath,
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        '-',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    ffmpeg.stderr.on('data', (data: Buffer) => {
        logger.debug('[FFmpeg] ' + data.toString().trim());
    });

    ffmpeg.on('error', (err: Error) => {
        logger.error('[FFmpeg] Error: ' + err.message);
    });

    const resource: AudioResource = createAudioResource(ffmpeg.stdout!, {
        inputType: StreamType.Raw,
        inlineVolume: true,
    });

    resource.playStream?.on('error', (error: Error) => {
        logger.error('[Resource] Error en el stream: ' + error.message);
    });

    connection.subscribe(player);

    const cleanup = () => {
        activeConnections.delete(guildId);
        connection.destroy();
        if (!ffmpeg.killed) ffmpeg.kill();
    };

    activeConnections.set(guildId, connection);
    player.play(resource);

    return new Promise<void>((resolve, reject) => {
        player.on(AudioPlayerStatus.Playing, () => {
            logger.info('Reproduciendo audio...');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            logger.info('Audio terminado.');
            cleanup();
            if (onFinish) onFinish();
            resolve();
        });

        player.on('error', error => {
            logger.error('Error en el reproductor de audio: ' + error);
            cleanup();
            reject(error);
        });
    });
}