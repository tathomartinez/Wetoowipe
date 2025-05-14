import cron from 'node-cron';
import { Client, Guild, VoiceChannel } from 'discord.js';
import { musicPlayer } from '../core/musicPlayer';
import AudioPaths from '../audio/audioPaths';
import logger from '../services/logger';
// import SpotifyWebApi from 'spotify-web-api-node'; // Si quieres usar Spotify

const GUILD_ID = '577233229136920586';
const VOICE_CHANNEL_ID = '577233229136920590';

export function scheduleDailySoundtrack(client: Client) {
    // Ejecuta todos los días a las 8:00 AM
    cron.schedule('45 18 14 05 * ', async () => {
        try {
            const guild = client.guilds.cache.get(GUILD_ID) as Guild;
            const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID) as VoiceChannel;
            if (!voiceChannel) return;

            await musicPlayer({
                voiceChannel,
                guild,
                audioPath: AudioPaths.help,
            });

            // Aquí puedes agregar la lógica para conectarte a Spotify
            // const spotifyApi = new SpotifyWebApi({ ... });
            // await spotifyApi.play({ uris: ['spotify:track:ID'] });

            logger.info('Audio reproducido automáticamente y conectado a Spotify.');
        } catch (error) {
            logger.error(`Error en la tarea programada: ${error}`);
        }
    });
}