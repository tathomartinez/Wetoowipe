const groupManager = require('../groups/groupManager');

async function startCountdown(groupId, guild, durationInMinutes) {
    console.log(`Iniciando cuenta atrás para el grupo ${groupId}. Será eliminado en ${durationInMinutes} minutos.`);

    setTimeout(async () => {
        try {
            const result = await groupManager.deleteGroup(groupId, guild);
            console.log(result);
        } catch (error) {
            console.error(`Error al eliminar el grupo ${groupId}:`, error.message);
        }
    }, durationInMinutes * 60 * 1000); // Convertir minutos a milisegundos
}

module.exports = { startCountdown };