const Discord = require('discord.js');
const discordConfig = require('./discordConfig.js');
const config = require('./config.js');
const client = new Discord.Client();
const fs = require('fs');
const timewait = Number(20 * 60000) // (n*60000) donde n son los minutos y se transforman en ms

client.commands = new Discord.Collection();

const commandFile = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'))
for (const file of commandFile) {
    const command = require(`./src/commands/${file}`)
    client.commands.set(command.name, command)
}

client.once('ready', () => {
    console.log('WORKS.....!!!!')
});

client.on('message', message => {
    if (!message.content.startsWith(config.PREFIJOBOT) || message.author.bot) return;
    const args = message.content.slice(config.PREFIJOBOT.length).split(/ +/);
    const command = args.shift().toLocaleLowerCase();
    var interval;

    if (command === 'hola') {
        client.commands.get(command).execute(message, args)
    }

    if (command === 'chiste') {
        client.commands.get(command).execute(message, args)
    }

    if (command === 'update') {
        client.commands.get(command).execute(message, args)
    }

    if (command === 'status') {
        client.commands.get(command).execute(message, args)
    }

    if (command === 'shutdown') {
        client.commands.get(command).execute(message, args)
    }

    if (command === 'chistedemon') {
        interval = setInterval(function () {
            client.commands.get('chiste').execute(message, args)
        }, timewait);
    }

});

client.login(discordConfig.TOKEN);
