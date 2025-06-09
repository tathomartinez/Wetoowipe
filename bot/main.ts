import 'dotenv/config';
import client from './src/core/client';
import loadCommands from './src/core/commandLoader';
import loadEvents from './src/core/eventLoader';
import startJokeCycle from './src/core/jokeManager';
import { scheduleDailySoundtrack } from './src/soundtrack/scheduleDailySountrack'; // <-- AGREGA ESTA LÍNEA


// Cargar comandos, eventos y ciclo de chistes
loadCommands(client);
loadEvents(client);
startJokeCycle(client);

// Iniciar sesión en Discord
client.login(process.env.TOKEN);
// scheduleDailySoundtrack(client);