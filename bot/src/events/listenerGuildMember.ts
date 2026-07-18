import { Events, GuildMember, TextChannel } from 'discord.js';
import { config } from '../config/config';
import logger from '../services/logger';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    execute(member: GuildMember) {
        logger.info(`Un nuevo miembro ha sido agregado: ${member.user.tag}`);
        if (member.id === config.specificUserId) {
            const welcomeChannel = member.guild.channels.cache.find(
                (channel): channel is TextChannel => channel.name === 'general'
            );
            if (welcomeChannel) {
                welcomeChannel.send(`¡Usted esta siendo acosado, ${member.user.tag}! 🎉`);
            }
        }
    },
};
