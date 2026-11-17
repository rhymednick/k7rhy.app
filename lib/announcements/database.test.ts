// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ query: vi.fn().mockResolvedValue({ rows: [{ product_id: '123' }] }), construct: vi.fn() }));
vi.mock('pg', () => ({
    Pool: class {
        constructor(options: unknown) {
            mocks.construct(options);
        }
        query = mocks.query;
        on() {
            return this;
        }
    },
}));
afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
});
it('loads without a connection and fails clearly only when storage is used', async () => {
    vi.stubEnv('DISCORD_ANNOUNCEMENTS_DATABASE_URL', '');
    const { database } = await import('./database');
    expect(mocks.construct).not.toHaveBeenCalled();
    await expect(database().sql`SELECT 1`).rejects.toThrow('Configure DISCORD_ANNOUNCEMENTS_DATABASE_URL');
    expect(mocks.construct).not.toHaveBeenCalled();
});
it('parameterizes values and reuses a small pool', async () => {
    vi.stubEnv('DISCORD_ANNOUNCEMENTS_DATABASE_URL', 'postgresql://localhost/isolated-test');
    const { database } = await import('./database');
    const value = "123'; DROP TABLE items; --";
    expect(await database().sql`SELECT product_id FROM items WHERE product_id = ${value}`).toEqual([{ product_id: '123' }]);
    await database().sql`SELECT 1`;
    expect(mocks.query).toHaveBeenCalledWith('SELECT product_id FROM items WHERE product_id = $1', [value]);
    expect(mocks.construct).toHaveBeenCalledOnce();
});
