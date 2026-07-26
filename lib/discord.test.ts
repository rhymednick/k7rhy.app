import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRecentAnnouncements, splitDiscordMessageContent } from './discord';

describe('fetchRecentAnnouncements', () => {
    let originalToken: string | undefined;

    beforeEach(() => {
        originalToken = process.env.DISCORD_BOT_TOKEN;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalToken === undefined) {
            delete process.env.DISCORD_BOT_TOKEN;
        } else {
            process.env.DISCORD_BOT_TOKEN = originalToken;
        }
    });

    it('returns unavailable without a bot token', async () => {
        delete process.env.DISCORD_BOT_TOKEN;
        expect(await fetchRecentAnnouncements('1432603806704603248')).toEqual({ status: 'unavailable', messages: [] });
    });

    it('requests a bounded newest-first channel history', async () => {
        process.env.DISCORD_BOT_TOKEN = 'test-token';
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: '1', content: 'Update', author: { username: 'k7rhy', global_name: 'Rhy' }, timestamp: '2026-07-26T12:00:00.000Z' }],
        });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchRecentAnnouncements('1432603806704603248', 10);

        expect(fetchMock).toHaveBeenCalledWith('https://discord.com/api/v10/channels/1432603806704603248/messages?limit=10', expect.objectContaining({ next: { revalidate: 300 } }));
        expect(result.status).toBe('available');
    });

    it('caps the Discord request at twenty messages', async () => {
        process.env.DISCORD_BOT_TOKEN = 'test-token';
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
        vi.stubGlobal('fetch', fetchMock);

        await fetchRecentAnnouncements('1432603806704603248', 100);

        expect(fetchMock).toHaveBeenCalledWith('https://discord.com/api/v10/channels/1432603806704603248/messages?limit=20', expect.any(Object));
    });

    it.each(['network', 'response'])('returns unavailable for a failed Discord %s', async (failure) => {
        process.env.DISCORD_BOT_TOKEN = 'test-token';
        vi.stubGlobal('fetch', failure === 'network' ? vi.fn().mockRejectedValue(new Error('network')) : vi.fn().mockResolvedValue({ ok: false, status: 403 }));

        expect(await fetchRecentAnnouncements('1432603806704603248')).toEqual({ status: 'unavailable', messages: [] });
    });
});

describe('splitDiscordMessageContent', () => {
    it('recognizes only http and https links', () => {
        expect(splitDiscordMessageContent('See https://k7rhy.app and javascript:alert(1)')).toEqual([
            { kind: 'text', value: 'See ' },
            { kind: 'link', value: 'https://k7rhy.app' },
            { kind: 'text', value: ' and javascript:alert(1)' },
        ]);
    });
});
