const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Sends a DM to a user with optional interactive components
 * @param {User} user - The user to send the DM to
 * @param {string} messageContent - The content of the DM
 * @param {Array<ActionRowBuilder>} [components] - Optional interactive components (e.g., buttons)
 */
async function sendSuccessDM(user, messageContent, components = []) {
    try {
        await user.send({
            content: messageContent,
            components: components,
        });
        console.log(`[DEBUG] DM sent to ${user.tag}`);
    } catch (error) {
        console.error(`Failed to send DM to ${user.tag}:`, error.message);
    }
}

module.exports = { sendSuccessDM };