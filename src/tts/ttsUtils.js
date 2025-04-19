const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const streamPipeline = promisify(pipeline);

/**
 * Envía una solicitud POST al servidor TTS.
 */
async function sendTTSRequest(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Respuesta no válida del POST TTS: ${text}`);
    }
}

/**
 * Consulta el resultado TTS usando el event_id.
 */
async function getTTSResult(baseUrl, eventId) {
    const res = await fetch(`${baseUrl}/${eventId}`);
    const rawText = await res.text();

    try {
        const jsonText = "[" + rawText.split("[")[1].trim();
        return JSON.parse(jsonText);
    } catch {
        throw new Error(`Respuesta GET no válida del servidor TTS: ${rawText}`);
    }
}

/**
 * Descarga un archivo de audio desde una URL.
 */
async function downloadAudioFile(audioUrl, outputPath) {
    const res = await fetch(audioUrl);
    if (!res.ok) {
        throw new Error(`Error al descargar el audio: ${res.statusText}`);
    }
    await streamPipeline(res.body, fs.createWriteStream(outputPath));
}

/**
 * Conecta al canal de voz y reproduce un archivo de audio.
 */
async function playAudioInVoiceChannel(interaction, voiceChannel, audioPath) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(audioPath);

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        fs.unlinkSync(audioPath);
    });

    player.on('error', error => {
        console.error('Error en la reproducción de audio:', error);
        connection.destroy();
        fs.unlinkSync(audioPath);
    });
}

module.exports = {
    sendTTSRequest,
    getTTSResult,
    downloadAudioFile,
    playAudioInVoiceChannel
};
