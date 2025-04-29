import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { inspect } from 'node:util';
import logger from '../services/logger';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    logger.error('[DEPLOY] Asegúrate de que están definidas en el archivo .env.');
    process.exit(1);
}

interface Command {
    data: {
        name: string;
    };
    execute: (...args: any[]) => Promise<void>;
}

const commands: Array<Record<string, any>> = [];
const commandsPath = path.join(__dirname, '..', 'commands');

/**
 * Lee los comandos de forma recursiva desde un directorio.
 * @param dir - El directorio donde buscar comandos.
 */
function readCommands(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            readCommands(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            try {
                const commandModule = require(fullPath); // Carga el módulo
                const command = commandModule.default || commandModule; // Maneja exportaciones por defecto y normales

                if (command?.data?.toJSON) {
                    commands.push(command.data.toJSON());
                    logger.info(`[INFO] Comando registrado: ${command.data.name}`);
                } else {
                    logger.warn(`[WARNING] Skipped ${file} - missing .data.toJSON()`);
                }
            } catch (error) {
                logger.error(`[ERROR] Error al cargar el comando ${file}:`, error);
            }
        }
    }
}

readCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        logger.debug('[DEPLOY] Iniciando el registro de comandos...');
        logger.debug(`[DEPLOY] Comandos a registrar: ${inspect(commands)}`);

        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        ) as Array<Record<string, any>>;

        logger.info(`[DEPLOY] Comandos registrados: ${data.map(command => command.name).join(', ')}`);
    } catch (error) {
        logger.error(`[DEPLOY] Error al registrar comandos: ${error}`);
    }
})();
