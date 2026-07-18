import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('equipodev')
    .setDescription('Muestra quien es el equipodev');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        await interaction.deferReply();
        await interaction.editReply('Obviamente yo soy Tathito');
    } catch (error) {
        console.log(error);
    }
}

export default { data, execute };
