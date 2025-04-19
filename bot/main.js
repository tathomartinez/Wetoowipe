require('dotenv').config();

const client = require('./src/core/client');
const loadCommands = require('./src/core/commandLoader');
const loadEvents = require('./src/core/eventLoader');
const startJokeCycle = require('./src/core/jokeManager');

loadCommands(client);
loadEvents(client);
startJokeCycle(client);

client.login(process.env.TOKEN);
