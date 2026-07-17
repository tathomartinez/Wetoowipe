import { Events, GuildMember, TextChannel } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    execute(member: GuildMember) {
        console.log('Un nuevo miembro ha sido agregado:', member.user.tag);
        const specificUserId = '214877856994557952';
        if (member.id === specificUserId) {
            const welcomeChannel = member.guild.channels.cache.find(
                (channel): channel is TextChannel => channel.name === 'general'
            );
            if (welcomeChannel) {
                welcomeChannel.send(`¡Usted esta siendo acosado, ${member.user.tag}! 🎉`);
            }
        }
    },
};
