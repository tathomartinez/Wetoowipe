import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection } from 'discord.js';
import logger from '../services/logger';

interface Command {
    data: {
        name: string;
    };
    execute: (...args: any[]) => Promise<void>;
}

/**
 * Carga todos los comandos en el cliente de Discord.
 * @param client - El cliente de Discord.
 */
function loadCommands(client: Client) {
    // Inicializa la colección de comandos si no existe
    if (!client.commands) {
        client.commands = new Collection();
        logger.debug('[INFO] Colección de comandos inicializada.');
    }

    const commandsPath = path.join(__dirname, '../commands');
    logger.debug(`[INFO] Directorio de comandos: ${commandsPath}`);

    loadRecursively(commandsPath, client);

    logger.info(`[INFO] Comandos cargados: ${Array.from(client.commands.keys()).join(', ')}`);
}

/**
 * Carga comandos de forma recursiva desde un directorio.
 * @param dir - El directorio donde buscar comandos.
 * @param client - El cliente de Discord.
 */
function loadRecursively(dir: string, client: Client) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRecursively(fullPath, client);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            try {
                const commandModule = require(fullPath);
                const command = commandModule.default || commandModule;
                if (command?.data?.toJSON) {
                    ;
                    client.commands.set(command.data.name, command);
                    logger.info(`[INFO] Comando registrado: ${command.data.name}`);
                } else {
                    logger.warn(`[WARNING] Skipped ${file} - missing .data.toJSON()`);
                }
            } catch (error) {
                logger.error(`[ERROR] No se pudo cargar el comando ${file}:`, error);
            }
        }
    }
}

export default loadCommands;
