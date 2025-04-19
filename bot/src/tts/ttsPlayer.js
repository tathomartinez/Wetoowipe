const path = require('path');
const fs = require('fs');
const {
    sendTTSRequest,
    getTTSResult,
    downloadAudioFile,
    playAudioInVoiceChannel
} = require('./ttsUtils');
const logger = require('../services/logger');

const TTS_SERVER_URL = process.env.TTS_SERVER_URL;
const FILE_SERVER_URL = process.env.FILE_SERVER_URL;
const AUDIO_FILENAME = 'audio.wav';

/**
 * Reproduce un mensaje de texto generado por TTS en el canal de voz del usuario.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction - Interacción del comando.
 * @param {string} text - Texto a convertir en voz.
 */
async function playTTS(interaction, text) {
    try {
        logger.info(`Iniciando TTS para el texto: "${text}"`);
        logger.debug(`Texto original recibido: "${text}"`);

        if (!interaction.deferred && !interaction.replied) {
            logger.debug('Deferiendo la respuesta de la interacción...');
            await interaction.deferReply();
        }

        const postData = {
            data: [
                {
                    path: `${FILE_SERVER_URL}/mapacha_rev.wav`,
                    meta: { _type: "gradio.FileData" }
                },
                "",
                text,
                "F5-TTS",
                true,
                0,
                0.3
            ]
        };

        logger.debug('Enviando solicitud POST al servidor TTS...');
        const postResult = await sendTTSRequest(TTS_SERVER_URL, postData);
        logger.info('Solicitud POST enviada con éxito.');
        logger.debug(`Respuesta del servidor TTS: ${JSON.stringify(postResult)}`);

        const eventId = postResult?.event_id;
        if (!eventId) {
            logger.error('No se recibió un event_id válido del servidor TTS.');
            throw new Error('No se recibió un event_id válido del servidor TTS.');
        }

        logger.debug(`Obteniendo resultado del servidor TTS para event_id: ${eventId}`);
        const getResult = await getTTSResult(TTS_SERVER_URL, eventId);
        logger.debug(`Respuesta GET del servidor TTS: ${JSON.stringify(getResult)}`);

        const audioFile = getResult.find(f => f.orig_name === AUDIO_FILENAME);
        if (!audioFile?.url) {
            logger.error('No se pudo obtener la URL del archivo de audio.');
            throw new Error('No se pudo obtener la URL del archivo de audio.');
        }

        const audioPath = path.resolve(__dirname, AUDIO_FILENAME);
        logger.debug(`Descargando archivo de audio desde: ${audioFile.url}`);
        await downloadAudioFile(audioFile.url, audioPath);
        logger.info(`Archivo de audio descargado en: ${audioPath}`);

        const voiceChannel = interaction.member.voice?.channel;
        if (!voiceChannel) {
            logger.error('El usuario no está en un canal de voz.');
            throw new Error('Debes estar en un canal de voz para usar este comando.');
        }

        logger.debug('Reproduciendo el audio en el canal de voz...');
        await playAudioInVoiceChannel(interaction, voiceChannel, audioPath);

        logger.info('Audio reproducido con éxito.');
        await interaction.editReply('Reproduciendo el audio generado.');
    } catch (error) {
        logger.error(`Error en playTTS: ${error.message}`);
        if (!interaction.replied) {
            await interaction.editReply('Ocurrió un error al procesar el texto. Intenta nuevamente.');
        }
    }
}

module.exports = { playTTS };