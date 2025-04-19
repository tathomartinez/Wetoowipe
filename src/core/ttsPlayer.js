const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

async function playTTS(interaction, text) {
    try {
        // Deferir la respuesta inicial
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        }

        // 1. Realizar el POST al servidor TTS
        console.log('Enviando solicitud POST al servidor TTS...');
        const postResponse = await fetch('http://f5-tts:7860/gradio_api/call/infer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [
                    {
                        path: "http://file-server:80/mapacha_rev.wav",
                        meta: {
                            _type: "gradio.FileData"
                        }
                    },
                    "",
                    text,
                    "F5-TTS",
                    true,
                    0,
                    0.3
                ]
            })
        });

        console.log(`POST Status: ${postResponse.status}`);
        const postText = await postResponse.text();
        console.log(`POST Response Body: ${postText}`);

        let postResult;
        try {
            postResult = JSON.parse(postText); // Intentar parsear la respuesta como JSON
        } catch (error) {
            throw new Error(`La respuesta del POST no es un JSON válido: ${postText}`);
        }

        const eventId = postResult?.event_id;
        if (!eventId) {
            throw new Error('No se pudo obtener el EVENT_ID del servidor TTS.');
        }

        console.log(`EVENT_ID obtenido: ${eventId}`);

        // 2. Realizar el GET para obtener la URL del archivo .wav
        console.log(`Enviando solicitud GET para EVENT_ID: ${eventId}`);
        const getResponse = await fetch(`http://f5-tts:7860/gradio_api/call/infer/${eventId}`);

        console.log(`GET Status: ${getResponse.status}`);
        const getText = await getResponse.text();
        console.log(`GET Response Body: ${getText}`);

        let getResult;
        try {
            // Eliminar el prefijo "data: " para obtener un JSON válido
            const jsonText = "[" + getText.split("[")[1].trim();
            console.log(`--------------->JSON Text: ${jsonText}----------------`);
            getResult = JSON.parse(jsonText); // Intentar parsear la respuesta como JSON
        } catch (error) {
            throw new Error(`La respuesta del GET no es un JSON válido: ${jsonText}`);
        }

        console.log(`--------------->Resultado del GET: ${JSON.stringify(getResult)}`);

        // Extraer la URL del archivo de audio
        const audioFile = getResult.find(file => file.orig_name === "audio.wav"); // Buscar el objeto con "orig_name" igual a "audio.wav"
        const audioUrl = audioFile?.url;

        if (!audioUrl) {
            throw new Error('No se pudo obtener la URL del archivo de audio.');
        }

        console.log(`URL del archivo de audio: ${audioUrl}`);

        // 3. Descargar el archivo .wav
        const audioPath = path.join(__dirname, 'audio.wav');
        console.log(`--------------->Descargando archivo de audio desde: ${audioUrl}`);
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error(`Error al descargar el archivo de audio: ${audioResponse.statusText}`);
        }

        await streamPipeline(audioResponse.body, fs.createWriteStream(audioPath));
        console.log('Archivo de audio descargado.');
        // const audioResponse = await fetch(audioUrl);

        // if (!audioResponse.ok) {
        //     throw new Error(`Error al descargar el archivo de audio: ${audioResponse.statusText}`);
        // }

        // const writer = fs.createWriteStream(audioPath);
        // Readable.toWeb(audioResponse.body).pipe(writer);

        // await new Promise((resolve, reject) => {
        //     writer.on('finish', resolve);
        //     writer.on('error', reject);
        // });

        // console.log('Archivo de audio descargado.');

        // 4. Reproducir el archivo en el canal de voz
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            throw new Error('Debes estar en un canal de voz para usar este comando.');
        }

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
            console.log('Reproducción terminada.');
            connection.destroy();
            fs.unlinkSync(audioPath); // Eliminar el archivo descargado
        });

        player.on('error', error => {
            console.error('Error al reproducir el audio:', error);
            connection.destroy();
            fs.unlinkSync(audioPath); // Eliminar el archivo descargado
        });

        console.log('Reproduciendo audio...');
        await interaction.editReply('Reproduciendo el audio generado.');
    } catch (error) {
        console.error('Error en playTTS:', error);

        // Editar la respuesta inicial para indicar que ocurrió un error
        if (!interaction.replied) {
            await interaction.editReply('Ocurrió un error al procesar el texto. Intenta nuevamente.');
        }
    }
}

module.exports = { playTTS };