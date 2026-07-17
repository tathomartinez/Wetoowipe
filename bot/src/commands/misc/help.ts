import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra todos los comandos disponibles');

export async function execute(interaction: CommandInteraction): Promise<void> {
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
        .setTitle('📖 Lista de comandos disponibles')
        .setColor('Blue')
        .setDescription('Aquí están los comandos que puedes usar:');

    commands.forEach(command => {
        embed.addFields({
            name: `/${command.data.name}`,
            value: (command.data as { description?: string }).description || 'Sin descripción',
        });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default { data, execute };
