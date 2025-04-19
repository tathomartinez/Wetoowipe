const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

/**
 * Reproduce un archivo de audio en un canal de voz.
 * @param {Object} options - Opciones para la reproducción.
 * @param {Object} options.voiceChannel - Canal de voz donde se conectará el bot.
 * @param {Object} options.guild - Servidor donde se encuentra el canal de voz.
 * @param {string} options.audioPath - Ruta del archivo de audio a reproducir.
 * @param {Function} [options.onFinish] - Callback opcional que se ejecuta cuando el audio termina.
 */
async function musicPlayer({ voiceChannel, guild, audioPath, onFinish }) {
    if (!voiceChannel) {
        throw new Error('El usuario no está en un canal de voz.');
    }

    // Conectarse al canal de voz
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    // Crear un reproductor de audio
    const player = createAudioPlayer();

    // Cargar un archivo de audio o una URL
    const resource = createAudioResource(audioPath);

    // Conectar el reproductor al canal de voz
    connection.subscribe(player);

    // Reproducir el audio
    player.play(resource);

    // Manejar eventos del reproductor
    player.on(AudioPlayerStatus.Playing, () => {
        console.log('Reproduciendo audio...');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('Audio terminado.');
        connection.destroy(); // Desconectar del canal de voz
        if (onFinish) onFinish(); // Ejecutar callback si se proporciona
    });

    player.on('error', error => {
        console.error('Error en el reproductor de audio:', error);
        connection.destroy(); // Desconectar del canal de voz en caso de error
    });
}

module.exports = { musicPlayer };