const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const groupManager = require('../../groups/groupManager');
const { startCountdown } = require('../../utils/countdown');
const { sendMessageToChannel } = require('../../utils/channelWriter');

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

            if (tipo === 'pve') {
                await this.handlePvE(interaction, participantes);
            } else if (tipo === 'pvp') {
                await this.handlePvP(interaction, participantes);
            }
        } catch (error) {
            console.error('Error in requirecarry command:', error);
            await interaction.reply({ 
                content: 'Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.', 
                ephemeral: true 
            });
        }
    },

    /**
     * Handles PvE carry request
     * @param {Interaction} interaction 
     * @param {number} participants 
     */
    async handlePvE(interaction, participants) {
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
            await this.createAndSetupGroup(interaction, 'pve', participants, role);
            await i.editReply({
                content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: 'No seleccionaste un rol a tiempo. Por favor intenta nuevamente.',
                    components: [],
                });
            }
        });
    },

    /**
     * Handles PvP carry request
     * @param {Interaction} interaction 
     * @param {number} participants 
     */
    async handlePvP(interaction, participants) {
        await interaction.deferReply({ ephemeral: true });
        await this.createAndSetupGroup(interaction, 'pvp', participants);
        await interaction.editReply({
            content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
        });
    },

    /**
     * Creates a group and sets up all necessary components
     * @param {Interaction} interaction 
     * @param {string} type 
     * @param {number} participants 
     * @param {string|null} role 
     */
    async createAndSetupGroup(interaction, type, participants, role = null) {
        // Create the group
        const group = await groupManager.createGroup({
            guild: interaction.guild,
            type,
            participants,
            role,
        });

        this.debugLog(`Group created: ${group.id}`);

        // Prepare and send the announcement message
        const messageContent = this.createAnnouncementMessage(type, participants, role);
        const message = await sendMessageToChannel(
            interaction.client, 
            CARRY_CHANNEL_ID, 
            messageContent
        );

        // Add reactions and setup collector
        await message.react('✅');
        this.setupReactionCollector(message, group.id);

        // Start countdown
        startCountdown(group.id, interaction.guild, COUNTDOWN_DURATION_MINUTES);

        // Send DM to requester
        await this.sendSuccessDM(interaction.user, group.link);
    },

    /**
     * Creates the announcement message text
     * @param {string} type 
     * @param {number} participants 
     * @param {string|null} role 
     * @returns {string}
     */
    createAnnouncementMessage(type, participants, role = null) {
        let message = `⚔️ **¡Preparados guerreros para un carry!** ⚔️\n\n` +
            `**Tipo:** ${type.toUpperCase()}\n` +
            `**Participantes:** ${participants}\n`;
        
        if (role) {
            message += `**Rol buscado:** ${role}\n\n`;
        } else {
            message += '\n';
        }

        message += `Reacciona con ✅ para apuntarte.`;
        return message;
    },

    /**
     * Sets up reaction collector for group signups
     * @param {Message} message 
     * @param {string} groupId 
     */
    async setupReactionCollector(message, groupId) {
        try {
            // Asegúrate de que el mensaje esté completo (por si es parcial)
            if (message.partial) {
                await message.fetch();
            }
    
            const reactionFilter = async (reaction, user) => {
                try {
                    // Si la reacción es parcial, cargarla completa
                    if (reaction.partial) {
                        await reaction.fetch();
                    }
    
                    console.log(`Reaction detected: ${reaction.emoji.name} from ${user.tag}`);
    
                    // Solo aceptar ✅ y de usuarios que no son bots
                    return reaction.emoji.name === '✅' && !user.bot;
    
                } catch (error) {
                    console.error('Error fetching reaction:', error);
                    return false;
                }
            };
    
            const collector = message.createReactionCollector({
                filter: reactionFilter,
                time: REACTION_TIMEOUT_MINUTES * 60 * 1000,
            });
    
            collector.on('collect', (reaction, user) => {
                console.log(`User ${user.tag} joined group ${groupId}`);
                groupManager.addMemberToGroup(groupId, user.id); // <- tu lógica
            });
    
            collector.on('end', collected => {
                console.log(`Signup period ended for group ${groupId}. Total reactions collected: ${collected.size}`);
            });
    
            console.log(`Reaction collector set up for group ${groupId}`);
        } catch (error) {
            console.error('Error setting up reaction collector:', error);
        }
    },

    /**
     * Sends success DM to requester
     * @param {User} user 
     * @param {string} voiceChannelLink 
     */
    async sendSuccessDM(user, voiceChannelLink) {
        try {
            await user.send(`Tu grupo para el carry ha sido creado exitosamente. Aquí está el enlace al canal de voz: ${voiceChannelLink}`);
            this.debugLog(`DM sent to ${user.tag}`);
        } catch (error) {
            console.error(`Failed to send DM to ${user.tag}:`, error.message);
        }
    },

    /**
     * Debug logging helper
     * @param {string} message 
     */
    debugLog(message) {
        if (DEBUG_MODE) {
            console.log(`[DEBUG] ${message}`);
        }
    }
};