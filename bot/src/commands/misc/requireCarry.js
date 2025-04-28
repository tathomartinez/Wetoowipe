const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const groupManager = require('../../groups/groupManager');
const { startCountdown } = require('../../utils/countdown');
const { sendMessageToChannel } = require('../../utils/channelWriter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('requirecarry')
        .setDescription('Solicita ayuda para actividades PvE o PvP')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Elige el tipo de actividad')
                .setRequired(true)
                .addChoices(
                    { name: 'PvE', value: 'pve' },
                    { name: 'PvP', value: 'pvp' }
                )
        )
        .addIntegerOption(option =>
            option.setName('participantes')
                .setDescription('Cantidad de participantes')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        const participantes = interaction.options.getInteger('participantes');

        if (tipo === 'pve') {
            const rolesMenu = new StringSelectMenuBuilder()
                .setCustomId('select-role')
                .setPlaceholder('Selecciona el rol que buscas')
                .addOptions([
                    { label: 'DPS', value: 'dps' },
                    { label: 'Healer', value: 'healer' },
                    { label: 'Tank', value: 'tank' },
                ]);

            const row = new ActionRowBuilder().addComponents(rolesMenu);

            await interaction.reply({
                content: `Has solicitado ayuda para una actividad PvE con ${participantes} participantes. Selecciona el rol que buscas:`,
                components: [row],
                ephemeral: true,
            });

            const filter = i => i.customId === 'select-role' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                const role = i.values[0];
                const group = await groupManager.createGroup({
                    guild: interaction.guild,
                    type: tipo,
                    participants: participantes, // Asegúrate de pasar correctamente la variable
                    role,
                });
                // Enviar un mensaje al canal específico
                const channelId = '577233229136920588'; // Reemplaza con el ID del canal deseado
                const message = `Se ha creado un nuevo grupo para ${tipo} con ${participantes} participantes. Rol: ${role}.`;
                sendMessageToChannel(interaction.client, channelId, message);

                startCountdown(group.id, interaction.guild, 2); // Inicia la cuenta atrás de 15 minutos

                await i.update({
                    content: `Grupo creado exitosamente. Aquí está el enlace al canal de voz: ${group.link}`,
                    components: [],
                });
            });

        } else if (tipo === 'pvp') {
            const group = await groupManager.createGroup({
                guild: interaction.guild,
                type: tipo,
                participants: participantes, // Asegúrate de pasar correctamente la variable
                role: null,
            });

            // Enviar un mensaje al canal específico
            const channelId = '577233229136920588'; // Reemplaza con el ID del canal deseado
            const message = `Se ha creado un nuevo grupo para ${tipo} con ${participantes} participantes.`;
            sendMessageToChannel(interaction.client, channelId, message);

            startCountdown(group.id, interaction.guild, 2); // Inicia la cuenta atrás de 15 minutos

            await interaction.reply({
                content: `Has solicitado ayuda para una actividad PvP con ${participantes} participantes. Aquí está el enlace al canal de voz: ${group.link}`,
                ephemeral: true,
            });
        }
    },
};