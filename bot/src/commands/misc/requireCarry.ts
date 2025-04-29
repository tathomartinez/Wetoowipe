import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    Message,
    Guild,
    User,
    CommandInteractionOptionResolver,
} from 'discord.js';
import groupManager from '../../groups/groupManager';
import { sendMessageToChannel } from '../../utils/channelWriter';
import { sendSuccessDM } from '../../utils/dmSender';
import logger from '../../services/logger';
import * as util from 'util';

const CARRY_CHANNEL_ID = '868651189200379966';
const REACTION_TIMEOUT_MINUTES = 2;
const DEBUG_MODE = true;

interface Group {
    id: number;
    members: string[];
    teamCarry?: string[];
}

export default {
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

    async execute(interaction: CommandInteraction) {
        try {

            logger.debug(`Comando requirecarry ejecutado por ${util.inspect(interaction.user, { depth: null })}`);
            const tipo = (interaction.options as CommandInteractionOptionResolver).getString('tipo', true);
            const participantes = (interaction.options as CommandInteractionOptionResolver).getNumber('participantes', true);

            logger.info(`Comando requirecarry ejecutado por ${interaction.user.tag}. Tipo: ${tipo}, Participantes: ${participantes}`);

            if (tipo === 'pve') {
                await this.handlePvE(interaction, participantes);
            } else if (tipo === 'pvp') {
                await this.handlePvP(interaction, participantes);
            }
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Error en el comando requirecarry: ${error.message}`);
            } else {
                logger.error(`Error en el comando requirecarry: ${String(error)}`);
            }
            await interaction.reply({
                content: 'Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.',
                ephemeral: true,
            });
        }
    },

    async handlePvE(interaction: CommandInteraction, participants: number) {
        logger.info(`Procesando solicitud PvE de ${interaction.user.tag} con ${participants} participantes.`);
        const rolesMenu = new StringSelectMenuBuilder()
            .setCustomId('select-role')
            .setPlaceholder('Selecciona el rol que buscas')
            .addOptions([
                { label: 'DPS', value: 'dps' },
                { label: 'Healer', value: 'healer' },
                { label: 'Tank', value: 'tank' },
            ]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(rolesMenu);

        await interaction.reply({
            content: `Has solicitado ayuda para una actividad PvE con ${participants} participantes. Selecciona el rol que buscas:`,
            components: [row],
            ephemeral: true,
        });

        const filter = (i: any) => i.customId === 'select-role' && i.user.id === interaction.user.id;
        const collector = interaction.channel?.createMessageComponentCollector({
            filter,
            time: 15000,
        });

        collector?.on('collect', async i => {
            if (i.isStringSelectMenu()) {
                const role = i.values[0];
                await this.createAndSetupGroup(interaction, 'pve', participants, role);
            }
            await i.editReply({
                content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
            });
        });

        collector?.on('end', collected => {
            if (collected.size === 0) {
                logger.warn(`El usuario ${interaction.user.tag} no seleccionó un rol a tiempo.`);
                interaction.editReply({
                    content: 'No seleccionaste un rol a tiempo. Por favor intenta nuevamente.',
                    components: [],
                });
            }
        });
    },

    async handlePvP(interaction: CommandInteraction, participants: number) {
        logger.info(`Procesando solicitud PvP de ${interaction.user.tag} con ${participants} participantes.`);
        await interaction.deferReply({ ephemeral: true });
        await this.createAndSetupGroup(interaction, 'pvp', participants);
        await interaction.editReply({
            content: 'Grupo creado exitosamente. Revisa tus mensajes privados para más detalles.',
        });
    },

    async createAndSetupGroup(interaction: CommandInteraction, type: string, participants: number, role: string | null = null) {
        logger.info(`Creando grupo para ${interaction.user.tag}. Tipo: ${type}, Participantes: ${participants}, Rol: ${role || 'N/A'}`);
        const group = await groupManager.createGroup({
            guild: interaction.guild as Guild,
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

        this.setupReactionCollector(message, String(group.id), interaction.user);
    },

    async setupReactionCollector(message: Message, groupId: string, requester: User) {
        logger.info(`Configurando recolector de reacciones para el grupo ${groupId}.`);
        try {
            if (message.partial) {
                await message.fetch();
            }

            const participants: string[] = [];

            const reactionFilter = async (reaction: any, user: User) => {
                try {
                    if (reaction.partial) {
                        await reaction.fetch();
                    }

                    logger.debug(`Reacción detectada: ${reaction.emoji.name} de ${user.tag}`);
                    return reaction.emoji.name === '✅' && !user.bot;
                } catch (error) {
                    if (error instanceof Error) {
                        logger.error(`Error al procesar reacción: ${error.message}`);
                    } else {
                        logger.error(`Error al procesar reacción: ${String(error)}`);
                    }
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
                groupManager.addMemberToGroup(String(groupId), user.id);
            });

            collector.on('end', async collected => {
                logger.info(`Período de recolección de reacciones finalizado para el grupo ${groupId}. Total: ${collected.size}`);
                const group = groupManager.getGroupById(groupId);
                if (!group) {
                    logger.error(`No se encontró el grupo con ID ${groupId}.`);
                    return;
                }

                if (!group) {
                    logger.error(`No se encontró el grupo con ID ${groupId}.`);
                    return;
                }

                const participantList = group.members.length > 0
                    ? group.members.map((id, index) => `${index + 1}. <@${id}>`).join('\n')
                    : 'No hay participantes aún.';

                const dmContent = `Tu grupo para el carry ha sido creado. Aquí está la lista de participantes:\n\n${participantList}`;

                try {
                    if (group.members.length > 0) {
                        const buttons = group.members.map(memberId => {
                            return new ButtonBuilder()
                                .setCustomId(`contact_${memberId}_${groupId}`)
                                .setLabel(`Contactar a <@${memberId}>`)
                                .setStyle(ButtonStyle.Primary);
                        });

                        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

                        await sendSuccessDM(requester, dmContent, [actionRow]);
                        logger.info(`DM interactivo enviado a ${requester.tag} con la lista de participantes.`);
                    } else {
                        await sendSuccessDM(requester, dmContent);
                        logger.info(`DM enviado a ${requester.tag} sin participantes.`);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        logger.error(`Error al enviar DM a ${requester.tag}: ${error.message}`);
                    } else {
                        logger.error(`Error al enviar DM a ${requester.tag}: ${String(error)}`);
                    }
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Error al configurar el recolector de reacciones: ${error.message}`);
            } else {
                logger.error(`Error al configurar el recolector de reacciones: ${String(error)}`);
            }
        }
    },

    createAnnouncementMessage(type: string, participants: number, role: string | null = null): string {
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

    debugLog(message: string) {
        if (DEBUG_MODE) {
            logger.debug(message);
        }
    },
};