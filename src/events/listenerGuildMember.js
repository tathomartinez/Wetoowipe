const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false, // Este evento puede ocurrir varias veces
    execute(member) {
        // Verificar si el usuario tiene un ID específico
        console.log('Un nuevo miembro ha sido agregado:', member.user.tag);
        const specificUserId = '214877856994557952'; // Reemplaza con el ID que deseas verificar
        if (member.id === specificUserId) {
            const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'general'); // Cambia 'general' por el nombre de tu canal
            if (welcomeChannel) {
                welcomeChannel.send(`¡Usted esta siendo acosado, ${member.user.tag}! 🎉`);
            }
        }

    },
};