import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';
import logger from '../services/logger';
import { inspect } from 'util';

interface Event {
    name: string;
    once?: boolean;
    execute: (...args: unknown[]) => void;
}

export default async (client: Client): Promise<void> => {
    logger.debug('Cargando eventos...');
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const eventModule = await import(filePath);
            const event: Event = eventModule.default;

            if (!event || typeof event.name !== 'string' || typeof event.execute !== 'function') {
                logger.debug(`[ERROR] El archivo ${file} no exporta un evento válido.`);
                continue;
            }

            logger.debug(`Cargando evento: ${inspect(event.name)}`);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } catch (error) {
            logger.debug(`[ERROR] No se pudo cargar el archivo ${file}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
