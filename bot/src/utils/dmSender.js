/**
 * Sends a success DM to a user
 * @param {User} user - The user to send the DM to
 * @param {string} voiceChannelLink - The link to the voice channel
 */
async function sendSuccessDM(user, voiceChannelLink) {
    try {
        await user.send(`Tu grupo para el carry ha sido creado exitosamente. Aquí está el enlace al canal de voz: ${voiceChannelLink}`);
        console.log(`[DEBUG] DM sent to ${user.tag}`);
    } catch (error) {
        console.error(`Failed to send DM to ${user.tag}:`, error.message);
    }
}

module.exports = { sendSuccessDM };