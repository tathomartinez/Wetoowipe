import fs from 'fs';
import { spawn } from 'child_process';
import { ChatInputCommandInteraction, VoiceChannel } from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
    entersState,
    VoiceConnectionStatus,
} from '@discordjs/voice';

interface TTSResponse {
    event_id?: string;
}

interface TTSResultFile {
    url?: string;
    orig_name?: string;
}

export async function sendTTSRequest(url: string, body: unknown): Promise<TTSResponse> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    try {
        return JSON.parse(text) as TTSResponse;
    } catch {
        throw new Error(`Respuesta no válida del POST TTS: ${text}`);
    }
}

export async function getTTSResult(baseUrl: string, eventId: string): Promise<TTSResultFile[]> {
    const res = await fetch(`${baseUrl}/${eventId}`);
    const rawText = await res.text();

    try {
        const jsonText = '[' + rawText.split('[')[1].trim();
        return JSON.parse(jsonText) as TTSResultFile[];
    } catch {
        throw new Error(`Respuesta GET no válida del servidor TTS: ${rawText}`);
    }
}

export async function downloadAudioFile(audioUrl: string, outputPath: string): Promise<void> {
    const res = await fetch(audioUrl);
    if (!res.ok) {
        throw new Error(`Error al descargar el audio: ${res.statusText}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
}

export async function playAudioInVoiceChannel(
    interaction: ChatInputCommandInteraction,
    voiceChannel: VoiceChannel,
    audioPath: string
): Promise<void> {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId!,
        adapterCreator: interaction.guild!.voiceAdapterCreator as never,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
    } catch {
        connection.destroy();
        throw new Error('No se pudo conectar al canal de voz en 10s');
    }

    const player = createAudioPlayer();

    const ffmpeg = spawn('ffmpeg', [
        '-i', audioPath,
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        '-',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    const resource = createAudioResource(ffmpeg.stdout!, {
        inputType: StreamType.Raw,
    });

    connection.subscribe(player);
    player.play(resource);

    return new Promise<void>((resolve, reject) => {
        const cleanup = () => {
            connection.destroy();
            if (!ffmpeg.killed) ffmpeg.kill();
            try { fs.unlinkSync(audioPath); } catch {}
        };

        player.on(AudioPlayerStatus.Idle, () => {
            cleanup();
            resolve();
        });

        player.on('error', error => {
            cleanup();
            reject(error);
        });
    });
}
