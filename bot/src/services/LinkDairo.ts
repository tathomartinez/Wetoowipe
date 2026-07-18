import { Client, Message, TextChannel } from 'discord.js';

const channelLinkDairo = process.env.CHANNEL_LINK_DAIRO || '';

export function writeMessage(message: Message, client: Client): void {
    try {
        const channel = client.channels.cache.get(channelLinkDairo) as TextChannel;
        if (!channel) return;

        const output = `Ofrenda suministrado por : ${message.author}
            ofrenda :
            ${message.content}`;

        channel.send(output);
    } catch (error) {
        console.log(error);
    }
}
