const { Events } = require('discord.js');
const logger = require('../services/logger');
const util = require('util');
const groupManager = require('../groups/groupManager');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			// Manejar comandos
			await handleCommandInteraction(interaction);
		} else if (interaction.isButton()) {
			// Manejar botones
			await handleButtonInteraction(interaction);
		}
	},
};

/**
 * Maneja interacciones de comandos.
 * @param {CommandInteraction} interaction
 */
async function handleCommandInteraction(interaction) {
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		logger.error(`No se encontró un comando que coincida con ${interaction.commandName}.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logger.error(`Error al ejecutar el comando ${interaction.commandName}: ${error.message}`);
		logger.error(error);
	}
}
/**
 * Maneja interacciones de botones.
 * @param {ButtonInteraction} interaction
 */
async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;
	logger.info('Hot reload funcionando correctamente.');
    try {
        if (customId.startsWith('contact_')) {
            // Deferir la respuesta para evitar el límite de tiempo
            await interaction.deferReply({ ephemeral: true });

            // Extraer el índice del participante y el ID del grupo del customId
            const [, participant, groupId] = customId.split('_');
            const group = groupManager.getGroupById(groupId);

            if (!group) {
                await interaction.editReply({
                    content: 'El grupo ya no está disponible.',
                });
                logger.error(`No se encontró el grupo con ID ${groupId}.`);
                return;
            }

            logger.info(`Grupo encontrado: ${util.inspect(group)}`);

            const index = group.members.indexOf(participant);
            if (index === -1) {
                await interaction.editReply({
                    content: 'El participante seleccionado ya no está disponible.',
                });
                return;
            }

            const success = groupManager.moveMemberToTeamCarry(groupId, participant);
            if (!success) {
                await interaction.editReply({
                    content: `Has seleccionado contactar a <@${participant}> del grupo ${groupId}. Puedes enviarle un mensaje directamente.`,
                });
                return;
            }

            await interaction.editReply({
                content: `Has movido a <@${participant}> al equipo de carry del grupo ${groupId}.`,
            });

            logger.info(`Usuario ${interaction.user.tag} movió a <@${participant}> al equipo de carry del grupo ${groupId}.`);
        } else {
            await interaction.reply({
                content: 'Interacción no reconocida.',
                ephemeral: true,
            });
        }
    } catch (error) {
        logger.error(`Error al manejar la interacción del botón: ${error.message}`);
        if (!interaction.replied) {
            await interaction.reply({
                content: 'Ocurrió un error al procesar tu interacción.',
                ephemeral: true,
            });
        }
    }
}