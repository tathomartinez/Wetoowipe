const utilChistes = require('../util/readChistes');
const Discord = require('discord.js');
const config = require('../../config');

module.exports = {
    name: 'chiste',
    description: 'Sirve para contar chistes',
    execute(message, args){

        let chistes = utilChistes.listaChistes;
        let chiste = chistes[Math.floor(Math.random() * chistes.length)]
        
        const newEmbed = new Discord.MessageEmbed()
        .setColor(config.EMBEDCOLOR)
        .setTitle('El chiste de hoy')
        .setDescription(chiste)
        .setImage('https://render-us.worldofwarcraft.com/character/ragnaros/39/139444007-avatar.jpg?alt=wow/static/images/2d/avatar/4-1.jpg')
        .setFooter('Bazinga!!!!!!');
    
        message.channel.send(newEmbed);

    }
}