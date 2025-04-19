const { SlashCommandBuilder } = require('discord.js');
const { playTTS } = require('../../tts/ttsPlayer');
const logger = require('../../services/logger'); // Importar el logger

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

        try {
            logger.info(`Comando /tts invocado con el texto: "${text}"`);
            // Respuesta inicial para indicar que se está procesando
            await interaction.reply({ content: 'Procesando tu solicitud...', ephemeral: true });

            // Llamar a la función playTTS
            await playTTS(interaction, text);

            // Eliminar el mensaje después de 3 minutos
            setTimeout(() => {
                reply.delete().catch(err => logger.warn(`No se pudo eliminar el mensaje: ${err.message}`));
            }, 180000); // 3 minutos en milisegundos

        } catch (error) {
            // Registrar el error
            logger.error(`Error en el comando /tts: ${error.message}`);

            // Responder al usuario con un mensaje de error (solo visible para el invocador)
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.', ephemeral: true });
            }
        }
    }
};