import { SlashCommandBuilder, ChatInputCommandInteraction, Guild, VoiceChannel, GuildMember } from 'discord.js';
import { musicPlayer } from '../../core/musicPlayer';
import AudioPaths from '../../audio/audioPaths';

export const data = new SlashCommandBuilder()
    .setName('soundtrack')
    .setDescription('El bot se conecta al servidor y reproduce un audio');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice?.channel as VoiceChannel | null;

        if (!voiceChannel) {
            await interaction.reply({ content: '¡Debes estar en un canal de voz para usar este comando!', ephemeral: true });
            return;
        }

        await musicPlayer({
            voiceChannel,
            guild: interaction.guild as Guild,
            audioPath: AudioPaths.help,
        });

        await interaction.reply({ content: '🎵 Reproduciendo audio en el canal de voz.', ephemeral: true });
    } catch (error) {
        console.error('Error al ejecutar el comando soundtrack:', error);
        await interaction.reply({ content: '❌ No se pudo reproducir el audio.', ephemeral: true });
    }
}

export default { data, execute };