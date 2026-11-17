import { isShopifyTestOrder, isShopifyTestProduct, type ShopifyOrder } from '@/lib/sync/reverb-sync';
import { announcementChannel, processItem } from './process';
import { inventoryProduct, mapInventory, trackedProducts } from './store';

function id(value: unknown): string | null {
    return (typeof value === 'number' || typeof value === 'string') && /^\d+$/.test(String(value)) ? String(value) : null;
}
export async function handleAnnouncementWebhook(topic: string | null, payload: unknown, testHeader: string | null): Promise<void> {
    const channel = announcementChannel();
    if (!channel) {
        console.info('[discord-announcement] Posting disabled', JSON.stringify({ topic, context: process.env.K7RHY_DEPLOY_CONTEXT ?? process.env.CONTEXT ?? 'unknown', enabledOverride: process.env.DISCORD_ANNOUNCEMENTS_ENABLED ?? 'source default' }));
        return;
    }
    if (testHeader?.toLowerCase() === 'true') return;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid webhook payload');
    const data = payload as Record<string, unknown>;
    if (topic === 'products/create' || topic === 'products/update' || topic === 'products/delete') {
        if (isShopifyTestProduct(data)) return;
        const productId = id(data.id);
        if (!productId) throw new Error('Missing product ID');
        if (Array.isArray(data.variants)) {
            for (const variant of data.variants) {
                const inventoryId = id(variant?.inventory_item_id);
                if (inventoryId) await mapInventory(productId, inventoryId);
            }
        }
        await processItem(productId, channel, { unavailable: topic === 'products/delete' });
    } else if (topic === 'inventory_levels/update' || topic === 'inventory_levels/disconnect') {
        const inventoryId = id(data.inventory_item_id);
        if (!inventoryId) return;
        const productId = await inventoryProduct(inventoryId);
        if (productId) await processItem(productId, channel);
        else {
            // Inventory IDs are absent from Storefront. A backfilled item may not yet have
            // a REST product delivery to map it; reconcile tracked items on this event only.
            for (const trackedId of await trackedProducts()) await processItem(trackedId, channel);
        }
    } else if (topic === 'orders/create' || topic === 'orders/paid') {
        const order = data as ShopifyOrder;
        if (isShopifyTestOrder(order, testHeader) || data.cancelled_at) return;
        const sold = topic === 'orders/paid' || data.financial_status === 'paid';
        for (const productId of new Set((order.line_items ?? []).map((item) => id(item.product_id)).filter((value): value is string => value !== null))) {
            // Unpaid orders reserve inventory but do not establish a sale.
            await processItem(productId, channel, { sold, unavailable: !sold });
        }
    }
}
