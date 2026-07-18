export const config = {
    URL_UPDATE: 'https://raider.io/api/v1/characters/profile?',
    SUFIJO_ROL: '+',
    RAIDERIO_FIELDS: 'mythic_plus_scores_by_season:current',
    EMBEDCOLOR: '#fff',
    interval: '0',
    // Dynamic config from env
    guildId: process.env.GUILD_ID || '',
    voiceChannelId: process.env.VOICE_CHANNEL_ID || '',
    carryChannelId: process.env.CARRY_CHANNEL_ID || '',
    specificUserId: process.env.ADMIN_IDS?.split(',')[0] || '',
};
