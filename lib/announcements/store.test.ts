// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
const local = new PGlite();
vi.mock('pg', () => ({
    Pool: class {
        async query(sql: string, values?: unknown[]) {
            return local.query(sql, values);
        }
        on() {
            return this;
        }
    },
}));
import { acquireItem, inventoryProduct, mapInventory, trackedProducts } from './store';
beforeAll(async () => {
    vi.stubEnv('DISCORD_ANNOUNCEMENTS_DATABASE_URL', 'postgresql://localhost/isolated-test');
    await local.exec(await readFile('db/discord-announcements/migrations/20261117040000_discord_announcements.sql', 'utf8'));
}, 30000);
afterAll(async () => {
    await local.close();
    vi.unstubAllEnvs();
});
describe('persistent announcement state', () => {
    it('allows only one owner, persists write-ahead state, and releases the lease', async () => {
        const first = await acquireItem('123');
        await expect(acquireItem('123')).rejects.toThrow('already processing');
        await first.save({ pending: { key: 'test', nonce: 'test', kind: 'create', content: 'Hello', purpose: 'listing' } });
        await first.release();
        const second = await acquireItem('123');
        expect(second.state.pending?.content).toBe('Hello');
        await expect(first.save({})).rejects.toThrow('Lost announcement lease');
        await second.release();
    });
    it('rejects expired owners and permits recovery without losing pending data', async () => {
        const first = await acquireItem('124');
        await first.save({ failure: 'inspect pending post' });
        await local.query("UPDATE discord_announcement_items SET lock_until = now() - interval '1 second' WHERE product_id = $1", ['124']);
        const second = await acquireItem('124');
        expect(second.state.failure).toBe('inspect pending post');
        await expect(first.save({})).rejects.toThrow();
        await first.release();
        await expect(acquireItem('124')).rejects.toThrow();
        await second.release();
    });
    it('maps REST inventory IDs and finds backfilled tracked items', async () => {
        await mapInventory('123', '999');
        expect(await inventoryProduct('999')).toBe('123');
        const item = await acquireItem('125');
        await item.save({ messageId: '123456' });
        await item.release();
        expect(await trackedProducts()).toContain('125');
    });
});
