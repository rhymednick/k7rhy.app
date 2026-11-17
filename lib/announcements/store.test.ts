// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const blobs = vi.hoisted(() => {
    const files = new Map<string, { data: unknown; etag: string }>();
    let revision = 0;
    const getStore = vi.fn((options: { name: string }) => ({
        getWithMetadata: vi.fn(async (key: string) => {
            const file = files.get(`${options.name}/${key}`);
            return file ? structuredClone(file) : null;
        }),
        setJSON: vi.fn(async (key: string, data: unknown, condition: { onlyIfNew?: boolean; onlyIfMatch?: string }) => {
            const path = `${options.name}/${key}`;
            const file = files.get(path);
            if ((condition.onlyIfNew && file) || (condition.onlyIfMatch && condition.onlyIfMatch !== file?.etag)) return { modified: false };
            if (!condition.onlyIfNew && !condition.onlyIfMatch) throw new Error('Unconditional writes are forbidden');
            const etag = `"${++revision}"`;
            files.set(path, { data: JSON.parse(JSON.stringify(data)), etag });
            return { modified: true, etag };
        }),
    }));
    return { files, getStore };
});
vi.mock('@netlify/blobs', () => ({ getStore: blobs.getStore }));
import { acquireItem, inventoryProduct, mapInventory, trackedProducts, exportState } from './store';
beforeEach(() => {
    blobs.files.clear();
    vi.clearAllMocks();
    vi.stubEnv('CONTEXT', 'production');
});
afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
});
describe('JSON announcement file', () => {
    it('exports readable JSON without creating or locking a file', async () => {
        expect(await exportState()).toEqual({ version: 1, products: {}, inventory: {} });
        expect(blobs.files.size).toBe(0);
    });
    it('persists pending work and permits only one worker for the file', async () => {
        const first = await acquireItem('123');
        await expect(acquireItem('456')).rejects.toThrow('already processing');
        await first.save({ pending: { key: 'test', nonce: 'test', kind: 'create', content: 'Hello', purpose: 'listing' } });
        await first.release();
        const second = await acquireItem('123');
        expect(second.state.pending?.content).toBe('Hello');
        await expect(first.save({})).rejects.toThrow('Lost announcement file lease');
        await second.release();
        expect(blobs.files.size).toBe(1);
    });
    it('uses conditional creation when first deliveries arrive simultaneously', async () => {
        const results = await Promise.allSettled([acquireItem('123'), acquireItem('456')]);
        expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
        const winner = results.find((result) => result.status === 'fulfilled');
        if (winner?.status === 'fulfilled') await winner.value.release();
    });
    it('recovers expired leases without losing data or allowing a stale worker to save/release over a new owner', async () => {
        vi.useFakeTimers();
        const first = await acquireItem('123');
        await first.save({ failure: 'inspect pending post' });
        vi.advanceTimersByTime(121_000);
        const second = await acquireItem('123');
        expect(second.state.failure).toBe('inspect pending post');
        await expect(first.save({})).rejects.toThrow('Lost announcement file lease');
        await first.release();
        await expect(acquireItem('456')).rejects.toThrow('already processing');
        await second.release();
    });
    it('never overwrites an intervening file edit', async () => {
        const first = await acquireItem('123');
        const file = blobs.files.get('discord-announcements-production/announcements.json')!;
        file.etag = '"external-edit"';
        await expect(first.save({ messageId: '456' })).rejects.toThrow('file changed');
        await first.release();
    });
    it('retains other products and inventory mappings in the same JSON file', async () => {
        await mapInventory('123', '999');
        expect(await inventoryProduct('999')).toBe('123');
        for (const id of ['123', '456']) {
            const item = await acquireItem(id);
            await item.save({ messageId: `post-${id}` });
            await item.release();
        }
        expect(await trackedProducts()).toEqual(['123', '456']);
        expect(await inventoryProduct('999')).toBe('123');
        expect(blobs.files.size).toBe(1);
    });
    it('refuses to overwrite an invalid state file', async () => {
        blobs.files.set('discord-announcements-production/announcements.json', { data: { version: 2 }, etag: '"invalid"' });
        await expect(acquireItem('123')).rejects.toThrow('Invalid announcement JSON');
    });
    it('isolates preview state from production', async () => {
        const prod = await acquireItem('123');
        await prod.save({ messageId: '456' });
        await prod.release();
        vi.stubEnv('CONTEXT', 'deploy-preview');
        const preview = await acquireItem('123');
        expect(preview.state).toEqual({});
        await preview.release();
        vi.stubEnv('CONTEXT', 'production');
        const again = await acquireItem('123');
        expect(again.state.messageId).toBe('456');
        await again.release();
        expect(blobs.getStore).toHaveBeenCalledWith(expect.objectContaining({ consistency: 'strong' }));
    });
});
