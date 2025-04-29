import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'discord.js';
import logger from '../services/logger';
import util from 'node:util';


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
    const commandsPath = path.join(__dirname, '../commands');
    loadRecursively(commandsPath, client);

    console.log(`[INFO] Comandos cargados: ${Array.from(client.commands.keys()).join(', ')}`);
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

        logger.debug(`Cargando comando: ${fullPath}`);
        logger.debug(`Tipo de archivo: ${stat.isDirectory() ? 'Directorio' : 'Archivo'}`);
        logger.debug(`Nombre del archivo: ${file}`);

        if (stat.isDirectory()) {
            logger.debug(`Entrando en directorio: ${fullPath}`);
            loadRecursively(fullPath, client);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            logger.debug(`Cargando archivo de comando: ${fullPath}`);
            const command = require(fullPath) as Command;
            logger.debug(`Comando cargado: ${util.inspect(command)}`);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                logger.debug(`Comando cargado: ${command.data.name}`);
            } else {
                logger.warn(`[WARNING] El comando ${file} no tiene 'data' o 'execute'.`);
            }
        }
    }
}

export default loadCommands;
