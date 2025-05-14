import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Apaga el bot'),
    async execute(interaction: CommandInteraction): Promise<void> {
        try {
            await interaction.reply('Apagando el bot...');
            console.log('>>> Apagando el servidor');
            process.exit(0); // Salida exitosa
        } catch (error) {
            console.error('Error al intentar apagar el bot:', error);
            await interaction.reply('Hubo un error al intentar apagar el bot.');
        }
    },
};