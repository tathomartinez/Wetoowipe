import 'dotenv/config';
import { Channel, Client, Message, TextChannel } from 'discord.js';
import { writeMessage } from './LinkDairo';
import { whitelist } from '../data/whitelist';

const { CHANNEL_TEST } = process.env;

function validarChannelTest(channel: Channel): boolean {
    return channel.id === CHANNEL_TEST;
}

function validateMessageWhitelist(message: Message): boolean {
    if (message.content.trim() === '') return false;
    return !!whitelist.find(it => message.content.includes(it.value));
}

export function deleteMessage(channel: TextChannel, client: Client): void {
    channel.messages.fetch({ limit: 100 }).then(messages => {
        messages.forEach(message => {
            if (validateMessageWhitelist(message) && !validarChannelTest(channel)) {
                writeMessage(message, client);
            }
            channel.messages.delete(message.id);
        });
    });
}
