import logger from './logger';

function getEndpoint(): string {
    const apiUrl = process.env.GO_API_URL || 'http://localhost:8080';
    return `${apiUrl}/api/v1/voice-log`;
}

export async function logVoiceConnection(
    userId: string,
    channelId: string,
    guildId: string,
    eventType: 'join' | 'leave'
): Promise<void> {
    try {
        const response = await fetch(getEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            },
            body: JSON.stringify({
                user_id: userId,
                channel_id: channelId,
                guild_id: guildId,
                event_type: eventType
            })
        });

        if (!response.ok) {
            logger.debug(`Voice log API error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        logger.debug('Error logging voice connection:', error);
    }
}
