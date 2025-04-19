const { SlashCommandBuilder } = require('discord.js');
const { musicPlayer } = require('../../core/musicPlayer');
const AudioPaths = require('../../audio/audioPaths');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soundtrack')
        .setDescription('El bot se conecta al servidor y reproduce un audio'),

    async execute(interaction) {
        try {
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                return interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
            }

            await musicPlayer({
                voiceChannel,
                guild: interaction.guild,
                audioPath: AudioPaths.help,
            });

            return interaction.reply({ content: '🎵 Reproduciendo audio en el canal de voz.', ephemeral: true });
        } catch (error) {
            console.error('Error al ejecutar el comando soundtrack:', error);
            return interaction.reply({ content: '❌ No se pudo reproducir el audio.', ephemeral: true });
        }
    },
};