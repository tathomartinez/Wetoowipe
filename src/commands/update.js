const fetch = require("node-fetch");
const config = require('../../config');
const Discord = require('discord.js');

module.exports = {
    name: 'update',
    description: 'Sirve para actualizar roles por io',
    execute(message, args) {
        const rolesMitycPlus = message.member.guild.roles.cache.filter(item => item.name.startsWith(config.SUFIJO_ROL));

        let urlArgs = args[0].substring(args[0].indexOf('characters') + 11).split('/')
        let region = urlArgs[0];
        let realm = urlArgs[1];
        let name = urlArgs[2];
        let url = `${config.URL_UPDATE}region=${region}&realm=${realm}&name=${name}&fields=${config.RAIDERIO_FIELDS}`;

        let roles = message.member.guild.roles.cache

        fetch(url)
            .then(response => response.json())
            .then(json => {
                let score = json.mythic_plus_scores.all;
                let rol = String(config.SUFIJO_ROL + Math.trunc(parseFloat(json.mythic_plus_scores.all) / 100) * 100);
                let rolValido = roles.find(item => String(item.name) === String(rol));

                if (rolValido) {
                    if(!(message.member.roles.cache.find(r => String(r.name) === String(rol)))) {
                        rolesMitycPlus
                        .forEach(role => {
                            if(parseInt(role.name) <= parseInt(rol)){
                                message.member.roles.remove(role.id)
                            }
                        });
                        
                        message.member.roles.add(rolValido)
                    }
                } else {
                    crearRol(rol).then((item => {
                        
                        rolesMitycPlus
                        .forEach(role => {
                            if(parseInt(role.name) <= parseInt(rol)){
                                message.member.roles.remove(role.id)
                            }
                        });
                        
                        message.member.roles.add(item.id);
                    }), error => console.log(error));
                    console.log(`>>>> Se esta creando un nuevo rol: ${rol}`)
                }

                message.member.setNickname(`${name}-${realm.charAt(0).toUpperCase()}${realm.slice(1)}`)

                const newEmbed = new Discord.MessageEmbed()
                    .setColor(config.EMBEDCOLOR)
                    .setTitle('Gracias por actualizar')
                    .setDescription(`Hey tu rank es: ${score} tu nuevo rol: ${rol}`)
                    .setImage('https://render-us.worldofwarcraft.com/character/ragnaros/39/139444007-avatar.jpg?alt=wow/static/images/2d/avatar/4-1.jpg')
                    .setFooter('Que el destino te lleve con bien joven adalid!!!!!!');
    
                message.channel.send(newEmbed);
                
            })
            
            function crearRol(_name) {
                let newRol = message.guild.roles.create({
                data: {
                    name: _name,
                    color: colorHEX(),
                    permissions: 0
                },
                reason: 'we needed a role for Super Cool People',
            }).then(role => { return role });

            return newRol
        }

        function generarLetra() {
            const letras = ["a", "b", "c", "d", "e", "f", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            let numero = (Math.random() * 15).toFixed(0);
            return letras[numero];
        }

        function colorHEX() {
            let color = "";
            for (let i = 0; i < 6; i++) {
                color = color + generarLetra();
            }
            return "#" + color;
        }

    }
}