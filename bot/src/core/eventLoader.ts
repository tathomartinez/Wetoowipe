import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';
import logger from '../services/logger';
import { inspect } from 'util';

interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => void;
}

export default (client: Client): void => {
    logger.debug('Cargando eventos...');
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        logger.debug(`Cargando evento: ${file}`);
        const filePath = path.join(eventsPath, file);
        try {
            logger.debug(`Leyendo archivo: ${filePath}`);
            const event: Event = require(filePath).default;
            logger.debug(`Evento encontrado: ${inspect(event)}`);

            if (!event || !event.name || typeof event.execute !== 'function') {
                logger.error(`[ERROR] El archivo ${file} no exporta un evento válido.`);
                continue;
            }


            logger.debug(`Cargando evento: ${inspect(event)}`);
            

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        } catch (error) {
            logger.error(`[ERROR] No se pudo cargar el archivo ${file}: ${error}`);
        }
    }
};
