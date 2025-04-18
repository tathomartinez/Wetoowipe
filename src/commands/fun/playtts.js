const { SlashCommandBuilder } = require('discord.js');
const { playTTS } = require('../../core/ttsPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Convierte texto en audio y lo reproduce en el canal de voz.')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('El texto que quieres convertir en audio.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const text = interaction.options.getString('texto');
        await interaction.reply('Procesando tu solicitud...');
        await playTTS(interaction, text);
    }
};