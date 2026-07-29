import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.stubEnv('GO_API_URL', 'http://test-api:8080');
vi.stubEnv('API_TOKEN', 'test-token');

import { logVoiceConnection } from './voiceLogService';

describe('logVoiceConnection', () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends POST request to voice-log endpoint with join event', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await logVoiceConnection('user123', 'channel456', 'guild789', 'join');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
            'http://test-api:8080/api/v1/voice-log',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token',
                },
                body: JSON.stringify({
                    user_id: 'user123',
                    channel_id: 'channel456',
                    guild_id: 'guild789',
                    event_type: 'join',
                }),
            }
        );
    });

    it('sends POST request with leave event', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await logVoiceConnection('user456', 'channel789', 'guild789', 'leave');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({
                    user_id: 'user456',
                    channel_id: 'channel789',
                    guild_id: 'guild789',
                    event_type: 'leave',
                }),
            })
        );
    });

    it('does not throw on API error', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });

        await expect(logVoiceConnection('user123', 'channel456', 'guild789', 'join')).resolves.toBeUndefined();
    });

    it('does not throw on network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(logVoiceConnection('user123', 'channel456', 'guild789', 'join')).resolves.toBeUndefined();
    });
});
