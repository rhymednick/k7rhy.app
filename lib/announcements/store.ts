import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import type { ItemState } from './model';

export interface ItemSession {
    state: ItemState;
    save(state: ItemState): Promise<void>;
    release(): Promise<void>;
}
interface StateFile {
    version: 1;
    products: Record<string, ItemState>;
    inventory: Record<string, string>;
    lease?: { owner: string; expires: number };
}
const FILE = 'announcements.json';
const LEASE_MS = 120_000;
function store() {
    // Site-wide state survives deploys. Every non-production context gets another store.
    return getStore({ name: process.env.CONTEXT === 'production' ? 'discord-announcements-production' : 'discord-announcements-preview', consistency: 'strong' });
}
function object(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
async function read(storage: ReturnType<typeof store>): Promise<{ data: StateFile; etag?: string }> {
    const result = await storage.getWithMetadata(FILE, { type: 'json' });
    if (!result) return { data: { version: 1, products: {}, inventory: {} } };
    const data: unknown = result.data;
    if (!result.etag || !object(data) || data.version !== 1 || !object(data.products) || !object(data.inventory) || Object.values(data.products).some((value) => !object(value)) || Object.values(data.inventory).some((value) => typeof value !== 'string') || (data.lease !== undefined && (!object(data.lease) || typeof data.lease.owner !== 'string' || typeof data.lease.expires !== 'number'))) {
        throw new Error('Invalid announcement JSON state; inspect the stored file before replay');
    }
    return { data: data as unknown as StateFile, etag: result.etag };
}
async function write(storage: ReturnType<typeof store>, data: StateFile, etag?: string): Promise<string> {
    const result = await storage.setJSON(FILE, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (!result.modified || !result.etag) throw new Error('Announcement file changed during processing; retry delivery');
    return result.etag;
}
function unlocked(data: StateFile) {
    if (data.lease && data.lease.expires > Date.now()) throw new Error('Announcement file is already processing; retry delivery');
}

/** Serialize the small JSON file using conditional writes, never unconditional overwrite. */
export async function acquireItem(id: string): Promise<ItemSession> {
    const storage = store();
    const snapshot = await read(storage);
    unlocked(snapshot.data);
    const data = snapshot.data;
    const owner = randomUUID();
    data.lease = { owner, expires: Date.now() + LEASE_MS };
    let etag = await write(storage, data, snapshot.etag);
    let released = false;
    return {
        state: structuredClone(data.products[id] ?? {}),
        async save(state) {
            if (released || !data.lease || data.lease.expires <= Date.now()) throw new Error('Lost announcement file lease; inspect pending delivery before replay');
            data.products[id] = structuredClone(state);
            data.lease.expires = Date.now() + LEASE_MS;
            etag = await write(storage, data, etag);
        },
        async release() {
            if (released) return;
            released = true;
            // A timed-out worker must never clear a newer worker's lease.
            const current = await read(storage);
            if (current.data.lease?.owner !== owner) return;
            delete current.data.lease;
            await write(storage, current.data, current.etag);
        },
    };
}
export async function mapInventory(productId: string, inventoryId: string): Promise<void> {
    const storage = store();
    const snapshot = await read(storage);
    if (snapshot.data.inventory[inventoryId] === productId) return;
    unlocked(snapshot.data);
    snapshot.data.inventory[inventoryId] = productId;
    await write(storage, snapshot.data, snapshot.etag);
}
export async function inventoryProduct(inventoryId: string): Promise<string | null> {
    return (await read(store())).data.inventory[inventoryId] ?? null;
}
/** Bootstrap/backfill may precede any REST product payload carrying inventory IDs. */
export async function trackedProducts(): Promise<string[]> {
    const { data } = await read(store());
    return Object.entries(data.products)
        .filter(([, state]) => state.messageId || state.listing?.ready)
        .map(([id]) => id);
}
/** Read-only JSON export for inspection/backup; no public route exposes this file. */
export async function exportState(): Promise<unknown> {
    return (await read(store())).data;
}
