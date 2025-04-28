const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const groupManager = require('../../groups/groupManager');
const { startCountdown } = require('../../utils/countdown');
const { sendMessageToChannel } = require('../../utils/channelWriter');
const { sendSuccessDM } = require('../../utils/dmSender');
const logger = require('../../services/logger'); // Importar el logger

// Constants
const CARRY_CHANNEL_ID = '868651189200379966';
const COUNTDOWN_DURATION_MINUTES = 2;
const REACTION_TIMEOUT_MINUTES = 2;
const DEBUG_MODE = true; // Set to false in production

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
        try {
            const tipo = interaction.options.getString('tipo');
            const participantes = interaction.options.getInteger('participantes');

            logger.info(`Comando requirecarry ejecutado por ${interaction.user.tag}. Tipo: ${tipo}, Participantes: ${participantes}`);

            if (tipo === 'pve') {
                await this.handlePvE(interaction, participantes);
            } else if (tipo === 'pvp') {
                await this.handlePvP(interaction, participantes);
            }
        } catch (error) {
            logger.error(`Error en el comando requirecarry: ${error.message}`);
            await interaction.reply({
                content: 'Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.',
                ephemeral: true
            });
        }
    },

    async handlePvE(interaction, participants) {
        logger.info(`Procesando solicitud PvE de ${interaction.user.tag} con ${participants} participantes.`);
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
            content: `Has solicitado ayuda para una actividad PvE con ${participants} participantes. Selecciona el rol que buscas:`,
            components: [row],
            ephemeral: true,
        });

        const filter = i => i.customId === 'select-role' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000
        });

        collector.on('collect', async i => {
            const role = i.values[0];
            logger.info(`Rol seleccionado por ${interaction.user.tag}: ${role}`);
            await this.createAndSetupGroup(interaction, 'pve', participants, role);
            await i.editReply({
                content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                logger.warn(`El usuario ${interaction.user.tag} no seleccionó un rol a tiempo.`);
                interaction.editReply({
                    content: 'No seleccionaste un rol a tiempo. Por favor intenta nuevamente.',
                    components: [],
                });
            }
        });
    },

    async handlePvP(interaction, participants) {
        logger.info(`Procesando solicitud PvP de ${interaction.user.tag} con ${participants} participantes.`);
        await interaction.deferReply({ ephemeral: true });
        await this.createAndSetupGroup(interaction, 'pvp', participants);
        await interaction.editReply({
            content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
        });
    },

    async createAndSetupGroup(interaction, type, participants, role = null) {
        logger.info(`Creando grupo para ${interaction.user.tag}. Tipo: ${type}, Participantes: ${participants}, Rol: ${role || 'N/A'}`);
        const group = await groupManager.createGroup({
            guild: interaction.guild,
            type,
            participants,
            role,
        });

        logger.debug(`Grupo creado con ID: ${group.id}`);

        const messageContent = this.createAnnouncementMessage(type, participants, role);
        const message = await sendMessageToChannel(
            interaction.client,
            CARRY_CHANNEL_ID,
            messageContent
        );

        logger.info(`Mensaje de anuncio enviado al canal ${CARRY_CHANNEL_ID}.`);

        await message.react('✅');
        logger.debug(`Reacción ✅ añadida al mensaje del grupo ${group.id}.`);

        this.setupReactionCollector(message, group.id, interaction.user);

        startCountdown(group.id, interaction.guild, COUNTDOWN_DURATION_MINUTES);
        logger.info(`Cuenta regresiva iniciada para el grupo ${group.id}.`);
    },

    async setupReactionCollector(message, groupId, requester) {
        logger.info(`Configurando recolector de reacciones para el grupo ${groupId}.`);
        try {
            if (message.partial) {
                await message.fetch();
            }

            const participants = [];

            const reactionFilter = async (reaction, user) => {
                try {
                    if (reaction.partial) {
                        await reaction.fetch();
                    }

                    logger.debug(`Reacción detectada: ${reaction.emoji.name} de ${user.tag}`);
                    return reaction.emoji.name === '✅' && !user.bot;

                } catch (error) {
                    logger.error(`Error al procesar reacción: ${error.message}`);
                    return false;
                }
            };

            const collector = message.createReactionCollector({
                filter: reactionFilter,
                time: REACTION_TIMEOUT_MINUTES * 60 * 1000,
            });

            collector.on('collect', (reaction, user) => {
                logger.info(`Usuario ${user.tag} se unió al grupo ${groupId}.`);
                participants.push(user.tag);
                groupManager.addMemberToGroup(groupId, user.id);
            });

            collector.on('end', async collected => {
                logger.info(`Período de recolección de reacciones finalizado para el grupo ${groupId}. Total: ${collected.size}`);
                const participantList = participants.length > 0
                    ? participants.join('\n')
                    : 'No hay participantes aún.';
                const dmContent = `Tu grupo para el carry ha sido creado. Aquí está la lista de participantes:\n\n${participantList}`;

                try {
                    await requester.send(dmContent);
                    logger.info(`DM enviado a ${requester.tag} con la lista de participantes.`);
                } catch (error) {
                    logger.error(`Error al enviar DM a ${requester.tag}: ${error.message}`);
                }
            });
        } catch (error) {
            logger.error(`Error al configurar el recolector de reacciones: ${error.message}`);
        }
    },
    /**
     * Crea un mensaje de anuncio para el grupo creado.
     * @param {string} type - Tipo de actividad (PvE o PvP).
     * @param {number} participants - Número de participantes.
     * @param {string|null} role - Rol seleccionado (solo para PvE).
     * @returns {string} - Mensaje de anuncio.
     */
    createAnnouncementMessage(type, participants, role = null) {
        if (type === 'pve') {
            return `📢 **¡Se necesita ayuda para una actividad PvE!**\n` +
                `🔹 **Participantes requeridos:** ${participants}\n` +
                `🔹 **Rol buscado:** ${role || 'Cualquiera'}\n` +
                `Reacciona con ✅ para unirte.`;
        } else if (type === 'pvp') {
            return `📢 **¡Se necesita ayuda para una actividad PvP!**\n` +
                `🔹 **Participantes requeridos:** ${participants}\n` +
                `Reacciona con ✅ para unirte.`;
        } else {
            return `📢 **¡Se necesita ayuda para una actividad!**\n` +
                `🔹 **Participantes requeridos:** ${participants}\n` +
                `Reacciona con ✅ para unirte.`;
        }
    },
    debugLog(message) {
        if (DEBUG_MODE) {
            logger.debug(message);
        }
    }
};