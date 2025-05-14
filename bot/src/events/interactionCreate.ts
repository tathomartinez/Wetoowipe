import { Events, CommandInteraction, Interaction } from 'discord.js';
import logger from '../services/logger';

export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            logger.debug(`No se encontró un comando que coincida con ${interaction.commandName}.`);
            await interaction.reply({
                content: 'Este comando no está registrado.',
                ephemeral: true,
            });
            return;
        }
        logger.debug(`Comando encontrado: ${interaction.commandName}`);
        try {
            await command.execute(interaction);
        } catch (error: any) {
            logger.debug(`Error al ejecutar el comando ${interaction.commandName}: ${error.message}`);
            await interaction.reply({
                content: 'Hubo un error al ejecutar este comando.',
                ephemeral: true,
            });
        }
    },
};