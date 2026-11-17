// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./process', () => ({ announcementChannel: () => '789', processItem: vi.fn() }));
vi.mock('./store', () => ({ inventoryProduct: vi.fn().mockResolvedValue('123'), mapInventory: vi.fn(), trackedProducts: vi.fn().mockResolvedValue(['123']) }));
import { processItem } from './process';
import { mapInventory } from './store';
import { handleAnnouncementWebhook } from './webhook';
beforeEach(() => vi.clearAllMocks());
describe('Shopify announcement events', () => {
    it('processes the product update produced by adding the readiness tag', async () => {
        await handleAnnouncementWebhook('products/update', { id: 123, tags: 'discord-ready' }, null);
        expect(processItem).toHaveBeenCalledWith('123', '789', { unavailable: false });
    });
    it('maps inventory IDs from product deliveries and uses inventory notifications', async () => {
        await handleAnnouncementWebhook('products/update', { id: 123, variants: [{ inventory_item_id: 321 }] }, null);
        expect(mapInventory).toHaveBeenCalledWith('123', '321');
        await handleAnnouncementWebhook('inventory_levels/update', { inventory_item_id: 321 }, null);
        expect(processItem).toHaveBeenLastCalledWith('123', '789');
    });
    it('ignores Shopify test headers and sample orders/products', async () => {
        await handleAnnouncementWebhook('products/update', { id: 123 }, 'true');
        await handleAnnouncementWebhook('products/update', { id: 123, title: 'Example T-Shirt' }, null);
        await handleAnnouncementWebhook('orders/paid', { test: true, line_items: [{ product_id: 123 }] }, null);
        expect(processItem).not.toHaveBeenCalled();
    });
    it('distinguishes paid orders from reservations and ignores cancelled orders', async () => {
        await handleAnnouncementWebhook('orders/create', { line_items: [{ product_id: 123 }, { product_id: 123 }] }, null);
        expect(processItem).toHaveBeenCalledOnce();
        expect(processItem).toHaveBeenLastCalledWith('123', '789', { sold: false, unavailable: true });
        await handleAnnouncementWebhook('orders/paid', { line_items: [{ product_id: 123 }] }, null);
        expect(processItem).toHaveBeenLastCalledWith('123', '789', { sold: true, unavailable: false });
        vi.clearAllMocks();
        await handleAnnouncementWebhook('orders/paid', { cancelled_at: '2026-11-17', line_items: [{ product_id: 123 }] }, null);
        expect(processItem).not.toHaveBeenCalled();
    });
});
