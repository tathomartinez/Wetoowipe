import path from 'path';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { JokeRepository } from '../../services/jokeReader';

const repo = new JokeRepository(path.join(__dirname, '../../services/chistes.txt'));

export const data = new SlashCommandBuilder()
    .setName('chiste')
    .setDescription('Sirve para contar chiste')
    .addStringOption(option =>
        option.setName('botenable')
            .setDescription('Toggle botEnable')
            .setRequired(false)
            .addChoices(
                { name: 'Yes', value: 'ON' },
                { name: 'No', value: 'OFF' },
            ));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const chiste = repo.getRandomJoke();
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('El chiste de hoy')
        .setDescription(chiste)
        .setImage('https://render-us.worldofwarcraft.com/character/ragnaros/39/139444007-avatar.jpg?alt=wow/static/images/2d/avatar/4-1.jpg')
        .setFooter({ text: 'Bazinga!!!!!!' });

    await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
