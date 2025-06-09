import { AttachmentBuilder, EmbedBuilder, Client, TextChannel } from 'discord.js';
import { request } from 'undici';
import logger from '../services/logger';
import { JokeRepository } from '../services/jokeReader';

const timewait = 5 * 60000; // 30 minutos

export interface IJokeProvider {
    getJoke(): Promise<string>;
}

// Proveedor de chistes desde API
export class ApiJokeProvider implements IJokeProvider {
    async getJoke(): Promise<string> {
        try {
            const response = await request('https://api.chucknorris.io/jokes/random');
            const { value } = await response.body.json() as { value: string };
            return value;
        } catch (error) {
            logger.error(`Error obteniendo chiste de API: ${error}`);
            return 'No se pudo obtener un chiste en este momento.';
        }
    }
}

// Proveedor de chistes desde archivo usando JokeRepository
export class FileJokeProvider implements IJokeProvider {
    private repo: JokeRepository;
    constructor(repo: JokeRepository) {
        this.repo = repo;
    }
    async getJoke(): Promise<string> {
        try {
            return this.repo.getRandomJoke();
        } catch (error) {
            logger.error(`Error obteniendo chiste de archivo: ${error}`);
            return 'No se pudo obtener un chiste en este momento.';
        }
    }
}

export function startJokeCycle(client: Client, jokeProvider: IJokeProvider) {
    logger.info('[CHISTES] Iniciando proceso de chistes...');
    setInterval(() => enviarChiste(client, jokeProvider), timewait);
    logger.info('[CHISTES] Intervalo de chistes activo.');
}

async function enviarChiste(client: Client, jokeProvider: IJokeProvider) {
    const channel = client.channels.cache.get(process.env.CHANNEL_JOKE!) as TextChannel;
    if (!channel) {
        logger.warn('No se encontró el canal de chistes.');
        return;
    }

    const value = await jokeProvider.getJoke();

    const file = new AttachmentBuilder('./assets/chuck.jpg');
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('El chiste de hoy')
        .setDescription(value)
        .setImage('attachment://chuck.jpg')
        .setFooter({ text: 'Bazinga!!!!!!' });

    channel.send({ embeds: [embed], files: [file] });
    logger.debug('Chiste enviado al canal.');
}