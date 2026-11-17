import { randomUUID } from 'node:crypto';
import { getDatabase } from '@netlify/database';
import type { ItemState } from './model';

export interface ItemSession {
    state: ItemState;
    save(state: ItemState): Promise<void>;
    release(): Promise<void>;
}
function database() {
    return getDatabase(process.env.NETLIFY_DB_URL ? { connectionString: process.env.NETLIFY_DB_URL } : undefined);
}
/** A bounded lease serializes each product. Every write checks ownership. */
export async function acquireItem(id: string): Promise<ItemSession> {
    const db = database();
    const owner = randomUUID();
    await db.sql`INSERT INTO discord_announcement_items(product_id) VALUES (${id}) ON CONFLICT DO NOTHING`;
    const rows = await db.sql<{ state: ItemState }>`UPDATE discord_announcement_items SET lock_owner = ${owner}, lock_until = now() + interval '120 seconds' WHERE product_id = ${id} AND (lock_until IS NULL OR lock_until < now()) RETURNING state`;
    if (!rows.length) throw new Error('Product announcement is already processing; retry delivery');
    return {
        state: rows[0].state,
        async save(state) {
            const result = await db.sql`UPDATE discord_announcement_items SET state = ${JSON.stringify(state)}::jsonb, lock_until = now() + interval '120 seconds' WHERE product_id = ${id} AND lock_owner = ${owner} AND lock_until > now() RETURNING product_id`;
            if (!result.length) throw new Error('Lost announcement lease; inspect pending delivery before replay');
        },
        async release() {
            await db.sql`UPDATE discord_announcement_items SET lock_owner = NULL, lock_until = NULL WHERE product_id = ${id} AND lock_owner = ${owner}`;
        },
    };
}
export async function mapInventory(productId: string, inventoryId: string): Promise<void> {
    await database().sql`INSERT INTO discord_announcement_inventory(inventory_item_id, product_id) VALUES (${inventoryId}, ${productId}) ON CONFLICT (inventory_item_id) DO UPDATE SET product_id = EXCLUDED.product_id`;
}
export async function inventoryProduct(inventoryId: string): Promise<string | null> {
    const rows = await database().sql<{ product_id: string }>`SELECT product_id FROM discord_announcement_inventory WHERE inventory_item_id = ${inventoryId}`;
    return rows[0]?.product_id ?? null;
}
/** Bootstrap/backfill may precede any REST product payload carrying inventory IDs. */
export async function trackedProducts(): Promise<string[]> {
    const rows = await database().sql<{ product_id: string }>`SELECT product_id FROM discord_announcement_items WHERE state ? 'messageId' OR state->'listing'->>'ready' = 'true'`;
    return rows.map((row) => row.product_id);
}
