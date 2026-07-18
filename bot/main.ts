import 'dotenv/config';
import client from './src/core/client';
import loadCommands from './src/core/commandLoader';
import loadEvents from './src/core/eventLoader';
import { startJokeCycle, ApiJokeProvider, FileJokeProvider } from './src/core/jokeManager';
import { JokeRepository } from './src/services/jokeReader';
import { DailySoundtrackScheduler } from './src/soundtrack/DailySoundtrackScheduler';
import logger from './src/services/logger';

// Cargar comandos y eventos
loadCommands(client);
loadEvents(client);

// Selecciona el proveedor de chistes (API o archivo)
let jokeProvider = new ApiJokeProvider();
// Si quieres usar archivo local, descomenta las siguientes líneas:
const repo = new JokeRepository('./src/services/chistes.txt');
jokeProvider = new FileJokeProvider(repo);

// Iniciar ciclo de chistes
startJokeCycle(client, jokeProvider);

client.login(process.env.TOKEN).then(() => {
    logger.info('Bot iniciado y autenticado correctamente.');
}).catch((err) => {
    logger.error(`Error al iniciar sesión: ${err}`);
});

// Puedes iniciar el DailySoundtrackScheduler en el evento 'ready' si lo necesitas
// client.once('ready', () => {
//     logger.info('Bot is ready!');
//     logger.info(`Logged in as ${client.user?.tag}`);
//     const scheduler = new DailySoundtrackScheduler(client);
//     scheduler.schedule();
// });