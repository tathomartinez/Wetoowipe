import cron from 'node-cron';
import { Client, Guild, VoiceChannel } from 'discord.js';
import { musicPlayer } from '../core/musicPlayer';
import AudioPaths from '../audio/audioPaths';
import logger from '../services/logger';

const GUILD_ID = '577233229136920586';
const VOICE_CHANNEL_ID = '577233229136920590';

export class DailySoundtrackScheduler {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public printCurrentTime(): void {
        const now = new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' });
        logger.debug(`Hora actual: ${now}`);
    }

    public async playSoundtrack(): Promise<void> {
        try {
            const guild = this.client.guilds.cache.get(GUILD_ID) as Guild;
            if (!guild) {
                logger.error('No se encontró el guild con el ID proporcionado.');
                return;
            }
            const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID) as VoiceChannel;
            if (!voiceChannel) {
                logger.error('No se encontró el canal de voz con el ID proporcionado.');
                return;
            }

            await musicPlayer({
                voiceChannel,
                guild,
                audioPath: AudioPaths.help,
            });

            logger.info('Audio reproducido automáticamente y conectado a Spotify.');
        } catch (error) {
            logger.error(`Error en la tarea programada: ${error}`);
        }
    }

    public schedule(cronPattern = '* * * * *'): void {
        logger.debug('Iniciando tarea programada para reproducir audio diariamente.');
        this.printCurrentTime();

        cron.schedule(cronPattern, async () => {
            logger.info('Ejecutando tarea programada de soundtrack.');
            this.printCurrentTime();
            await this.playSoundtrack();
        });
    }
}