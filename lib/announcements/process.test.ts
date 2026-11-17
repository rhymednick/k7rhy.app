// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { processItem, type AnnouncementDeps, announcementChannel } from './process';
import { DiscordRejection } from './discord';
import type { ItemState, Listing } from './model';

const listing: Listing = { id: '123', title: 'Tomatillo', description: 'A custom-assembled guitar.', price: 799, currency: 'USD', ready: true, available: true, links: [{ label: 'Purchase', url: 'https://shop.k7rhy.app/products/tomatillo' }] };
function fixture(initial: ItemState = {}) {
    let saved = structuredClone(initial);
    const send = vi.fn().mockResolvedValue('456');
    const read = vi.fn().mockResolvedValue(structuredClone(listing));
    let locked = false;
    const deps: AnnouncementDeps = {
        send,
        read,
        acquire: async () => {
            if (locked) throw new Error('locked');
            locked = true;
            return {
                state: structuredClone(saved),
                save: async (next) => {
                    saved = structuredClone(next);
                },
                release: async () => {
                    locked = false;
                },
            };
        },
    };
    return { deps, send, read, state: () => saved };
}
describe('announcement deliveries', () => {
    it('creates once and ignores repeated webhook deliveries', async () => {
        const f = fixture();
        await processItem('123', '789', {}, f.deps);
        await processItem('123', '789', {}, f.deps);
        expect(f.send).toHaveBeenCalledTimes(1);
        expect(f.state().messageId).toBe('456');
    });
    it('blocks publication when approved copy is missing, even if marked ready', async () => {
        const f = fixture();
        f.read.mockResolvedValue({ ...listing, description: '' });
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow('approved Discord description');
        expect(f.send).not.toHaveBeenCalled();
    });
    it.each([{ ready: false }, { available: false }])('does not announce an ineligible product %j', async (change) => {
        const f = fixture();
        f.read.mockResolvedValue({ ...listing, ...change });
        await processItem('123', '789', {}, f.deps);
        expect(f.send).not.toHaveBeenCalled();
    });
    it('announces a drop once, edits increases without an extra announcement, and tracks the new baseline', async () => {
        const f = fixture();
        await processItem('123', '789', {}, f.deps);
        f.read.mockResolvedValue({ ...listing, price: 750 });
        await processItem('123', '789', {}, f.deps);
        await processItem('123', '789', {}, f.deps);
        expect(f.send).toHaveBeenCalledTimes(3);
        expect(f.send.mock.calls[2][1].content).toContain('$799 → $750');
        f.read.mockResolvedValue({ ...listing, price: 780 });
        await processItem('123', '789', {}, f.deps);
        expect(f.send).toHaveBeenCalledTimes(4);
        expect(f.state().price).toBe(780);
    });
    it('marks a confirmed sale using saved data, preserves it on delayed product events, and never announces a sold item for the first time', async () => {
        const f = fixture();
        await processItem('123', '789', {}, f.deps);
        f.read.mockRejectedValue(new Error('Storefront unreachable'));
        await processItem('123', '789', { sold: true }, f.deps);
        expect(f.send.mock.calls[1][1].content).toContain('Sold:');
        f.read.mockResolvedValue(listing);
        await processItem('123', '789', {}, f.deps);
        expect(f.send).toHaveBeenCalledTimes(2);
        const unannounced = fixture();
        await processItem('123', '789', { sold: true }, unannounced.deps);
        await processItem('123', '789', {}, unannounced.deps);
        expect(unannounced.send).not.toHaveBeenCalled();
    });
    it('withdrawal is unavailable, and restocking restores the same post', async () => {
        const f = fixture();
        await processItem('123', '789', {}, f.deps);
        await processItem('123', '789', { unavailable: true }, f.deps);
        expect(f.send.mock.calls[1][1].content).toContain('Unavailable:');
        await processItem('123', '789', {}, f.deps);
        expect(f.send.mock.calls[2][1].kind).toBe('edit');
        expect(f.send.mock.calls[2][1].target).toBe('456');
    });
    it('persists an uncertain create and refuses to blindly create again', async () => {
        const f = fixture();
        f.send.mockRejectedValue(new Error('response lost'));
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow('response lost');
        expect(f.state().pending?.kind).toBe('create');
        f.send.mockResolvedValue('456');
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow('Uncertain Discord create');
        expect(f.send).toHaveBeenCalledTimes(1);
    });
    it('retries a definite rejection and an idempotent edit after a crash', async () => {
        const f = fixture();
        f.send.mockRejectedValueOnce(new DiscordRejection('rate limit'));
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow();
        expect(f.state().pending).toBeUndefined();
        await processItem('123', '789', {}, f.deps);
        f.read.mockResolvedValue({ ...listing, price: 750 });
        f.send.mockRejectedValueOnce(new Error('edit timeout'));
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow();
        await processItem('123', '789', {}, f.deps);
        expect(f.state().price).toBe(750);
        expect(f.state().pending).toBeUndefined();
    });
    it('does not send a rejected initial announcement after the item sells', async () => {
        const f = fixture();
        f.send.mockRejectedValueOnce(new DiscordRejection('rate limit'));
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow();
        await processItem('123', '789', { sold: true }, f.deps);
        expect(f.send).toHaveBeenCalledTimes(1);
        expect(f.state().sold).toBe(true);
    });
    it('serializes simultaneous product events', async () => {
        const f = fixture();
        const results = await Promise.allSettled([processItem('123', '789', {}, f.deps), processItem('123', '789', {}, f.deps)]);
        expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
        expect(f.send).toHaveBeenCalledTimes(1);
    });
    it('refuses silently moving an existing post to another channel', async () => {
        const f = fixture({ channelId: '999', messageId: '456', listing });
        await expect(processItem('123', '789', {}, f.deps)).rejects.toThrow('migration');
        expect(f.send).not.toHaveBeenCalled();
    });
    it('does not enable production writes from previews', () => {
        vi.stubEnv('DISCORD_ANNOUNCEMENTS_ENABLED', 'true');
        vi.stubEnv('CONTEXT', 'deploy-preview');
        vi.stubEnv('DISCORD_ANNOUNCEMENTS_CHANNEL_ID', '789');
        expect(announcementChannel()).toBeNull();
        vi.unstubAllEnvs();
    });
    it('uses the configured community channel only in production and honors an emergency disable', () => {
        vi.stubEnv('CONTEXT', 'production');
        vi.stubEnv('DISCORD_ANNOUNCEMENTS_ENABLED', undefined);
        vi.stubEnv('DISCORD_ANNOUNCEMENTS_CHANNEL_ID', undefined);
        expect(announcementChannel()).toBe('1432603806704603248');
        vi.stubEnv('DISCORD_ANNOUNCEMENTS_ENABLED', 'false');
        expect(announcementChannel()).toBeNull();
        vi.unstubAllEnvs();
    });
});
