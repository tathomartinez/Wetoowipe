import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { playTTS } from '../../tts/ttsPlayer';
import logger from '../../services/logger';

export const data = new SlashCommandBuilder()
    .setName('tts')
    .setDescription('Convierte texto en audio y lo reproduce en el canal de voz.')
    .addStringOption(option =>
        option.setName('texto')
            .setDescription('El texto que quieres convertir en audio.')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('texto', true); // El segundo parámetro asegura que el texto no sea null

    try {
        logger.info(`Comando /tts invocado con el texto: "${text}"`);
        // Respuesta inicial para indicar que se está procesando
        await interaction.reply({ content: 'Procesando tu solicitud...', ephemeral: false });

        // Obtener el mensaje enviado por interaction.reply
        const reply = await interaction.fetchReply();

        // Llamar a la función playTTS
        await playTTS(interaction, text);

        // Eliminar el mensaje después de 3 minutos
        setTimeout(() => {
            reply.delete().catch(err => logger.warn(`No se pudo eliminar el mensaje: ${err.message}`));
        }, 60000); // 1 minuto en milisegundos

    } catch (error) {
        // Registrar el error
        logger.debug(`Error en el comando /tts: ${(error as Error).message}`);

        // Responder al usuario con un mensaje de error (solo visible para el invocador)
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.' });
        } else {
            await interaction.reply({ content: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.', ephemeral: true });
        }
    }
}

export default { data, execute };