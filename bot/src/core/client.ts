import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { CommandInteraction } from 'discord.js';

interface Command {
    data: {
        name: string;
    };    
    execute: (...args: any[]) => Promise<void>;
    // execute: (interaction: CommandInteraction) => Promise<void>;
}

// Extender la interfaz de `Client` para incluir la propiedad `commands`
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
    }
}

// Crear una instancia del cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// Agregar la colección de comandos al cliente
client.commands = new Collection();

export default client;