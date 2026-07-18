import { Guild } from 'discord.js';
import groupManager from '../groups/groupManager';

export async function startCountdown(groupId: string, guild: Guild, durationInMinutes: number): Promise<void> {
    console.log(`Iniciando cuenta atrás para el grupo ${groupId}. Será eliminado en ${durationInMinutes} minutos.`);

    setTimeout(async () => {
        try {
            const result = await groupManager.deleteGroup(groupId, guild);
            console.log(result);
        } catch (error) {
            console.error(`Error al eliminar el grupo ${groupId}:`, (error as Error).message);
        }
    }, durationInMinutes * 60 * 1000);
}
