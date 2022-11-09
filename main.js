const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const fs = require('node:fs');
const path = require('node:path');
// const timewait = Number(20 * 60000) // (n*60000) donde n son los minutos y se transforman en ms

client.commands = new Collection();

const commandsPath = path.join(__dirname, '/src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// console.log(`${command}`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once('ready', () => {
	console.log('WORKS.....!!!!');
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	console.log(interaction);
	console.log(interaction.client);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

// client.on('message', message => {
//     console.log('WORKS MENSAJE.....!!!!')

//     console.log("message: " + message)
//     console.log("Prefijo bot " + config.PREFIJOBOT)
//     console.log("message: " + message.content)


//     if (!message.content.startsWith(config.PREFIJOBOT) || message.author.bot) return;
//     const args = message.content.slice(config.PREFIJOBOT.length).split(/ +/);
//     const command = args.shift().toLocaleLowerCase();

//     switch (command) {
//         case 'hola':
//             client.commands.get(command).execute(message, args)
//             break;
//         case 'chiste':
//             client.commands.get(command).execute(message, args)
//             break;
//         case 'update':
//             client.commands.get(command).execute(message, args)
//             break;
//         case 'status':
//             client.commands.get(command).execute(message, args)
//             break;
//         case 'shutdown':
//             client.commands.get(command).execute(message, args)
//             break;
//         case 'chistedemon':
//             var interval = setInterval(function () {
//                 client.commands.get('chiste').execute(message, args)
//             }, timewait);
//             break;
//         default:
//             break;
//     }

// });

client.login(token);
// client.login(discordConfig.TOKEN);
