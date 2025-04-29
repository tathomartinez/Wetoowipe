import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error('[DEPLOY] Faltan variables de entorno: TOKEN, CLIENT_ID o GUILD_ID.');
    process.exit(1);
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
                const command = require(fullPath).default;
                if (command?.data?.toJSON) {
                    commands.push(command.data.toJSON());
                } else {
                    console.warn(`[WARNING] Skipped ${file} - missing .data.toJSON()`);
                }
            } catch (error) {
                console.error(`[ERROR] No se pudo cargar el comando ${file}:`, error);
            }
        }
    }
}

readCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[DEPLOY] Subiendo ${commands.length} comandos a Discord...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        ) as Array<Record<string, any>>;

        console.log(`[DEPLOY] Completado con ${data.length} comandos registrados.`);
    } catch (error) {
        console.error('[DEPLOY] Error al registrar comandos:', error);
    }
})();
