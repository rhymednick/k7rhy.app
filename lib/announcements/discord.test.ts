// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { deliver, DiscordRejection } from './discord';
import { action } from './model';
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});
it('suppresses mentions and gives creates a stable nonce', async () => {
    vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: '456' }));
    vi.stubGlobal('fetch', fetcher);
    const job = action('123:1', 'create', 'Hello @everyone', 'listing');
    await expect(deliver('789', job)).resolves.toBe('456');
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.allowed_mentions.parse).toEqual([]);
    expect(body.enforce_nonce).toBe(true);
    expect(body.nonce).toBe(job.nonce);
});
it('distinguishes a definite rejection from an uncertain server response', async () => {
    vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
    vi.stubGlobal(
        'fetch',
        vi
            .fn()
            .mockResolvedValueOnce(new Response('', { status: 429 }))
            .mockResolvedValueOnce(new Response('', { status: 502 }))
    );
    const job = action('123:1', 'create', 'Hello', 'listing');
    await expect(deliver('789', job)).rejects.toBeInstanceOf(DiscordRejection);
    await expect(deliver('789', job)).rejects.not.toBeInstanceOf(DiscordRejection);
});
it.each([
    ['create', 'listing'],
    ['create', 'drop'],
    ['edit', 'listing'],
] as const)('suppresses link previews for %s %s messages without changing the links', async (kind, purpose) => {
    vi.stubEnv('DISCORD_BOT_TOKEN', 'test-token');
    const fetcher = vi.fn().mockResolvedValue(Response.json({ id: '456' }));
    vi.stubGlobal('fetch', fetcher);
    const content = 'Purchase: https://shop.k7rhy.app/products/example\nRecord: https://k7rhy.app/sn/STR26001';
    await deliver('789', action('123:2', kind, content, purpose, kind === 'edit' ? '456' : undefined));
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.flags).toBe(4);
    expect(body.content).toBe(content);
});
