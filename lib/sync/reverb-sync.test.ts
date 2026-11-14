import { describe, expect, it, vi } from 'vitest';
import type { ReverbListing } from '@/lib/reverb/client';
import { reverbPriceFor } from './price-rule';
import { checkProductAvailability, handleShopifyOrder, handleShopifyProductUpdate, type SyncDeps } from './reverb-sync';
import { verifyShopifyWebhook } from './shopify-webhook';
import { createHmac } from 'node:crypto';

function deps(overrides: Partial<SyncDeps> & { listing?: Partial<ReverbListing> } = {}): SyncDeps & { alerts: string[] } {
    const alerts: string[] = [];
    const listing: ReverbListing = { id: '103882256', state: 'live', price: 775, currency: 'USD', inventory: 1, ...overrides.listing };
    const link = { handle: 'cunife-s-type', title: 'CuNiFe S-Type', reverbListingId: '103882256' };
    return {
        alerts,
        lookupByProductId: vi.fn(async () => link),
        lookupByHandle: vi.fn(async () => link),
        getListing: vi.fn(async () => listing),
        endListing: vi.fn(async () => {}),
        updatePrice: vi.fn(async () => {}),
        canWriteReverb: () => true,
        alert: vi.fn(async (message: string) => {
            alerts.push(message);
        }),
        ...overrides,
    };
}

describe('reverbPriceFor', () => {
    it('adds 5% and rounds up to the next $5', () => {
        expect(reverbPriceFor(735)).toBe(775);
        expect(reverbPriceFor(799)).toBe(840);
        expect(reverbPriceFor(1020)).toBe(1075);
        expect(reverbPriceFor(100)).toBe(105);
    });

    it('rejects nonsense prices', () => {
        expect(() => reverbPriceFor(0)).toThrow();
    });
});

describe('handleShopifyOrder', () => {
    const order = { name: '#1042', line_items: [{ product_id: 15437136035997, title: 'CuNiFe S-Type' }] };

    it('ends the live Reverb listing after a Shopify sale', async () => {
        const d = deps();
        await handleShopifyOrder(order, d);
        expect(d.endListing).toHaveBeenCalledWith('103882256');
        expect(d.alerts[0]).toMatch(/ended its Reverb listing/);
    });

    it('flags a double sale instead of ending a sold listing', async () => {
        const d = deps({ listing: { state: 'sold' } });
        await handleShopifyOrder(order, d);
        expect(d.endListing).not.toHaveBeenCalled();
        expect(d.alerts[0]).toMatch(/Double sale.*#1042/);
    });

    it('asks for a manual end when Reverb refuses', async () => {
        const d = deps({ endListing: vi.fn(async () => Promise.reject(new Error('offer pending'))) });
        await handleShopifyOrder(order, d);
        expect(d.alerts[0]).toMatch(/End it by hand/);
    });

    it('ignores products with no Reverb listing', async () => {
        const d = deps({ lookupByProductId: vi.fn(async () => ({ handle: 'kit', title: 'Kit', reverbListingId: null })) });
        expect(await handleShopifyOrder(order, d)).toEqual([]);
        expect(d.getListing).not.toHaveBeenCalled();
    });
});

describe('handleShopifyProductUpdate', () => {
    it('moves the Reverb price to the rule when Shopify changes', async () => {
        const d = deps({ listing: { price: 845 } });
        await handleShopifyProductUpdate({ id: 1, status: 'active', variants: [{ price: '799.00' }] }, d);
        expect(d.updatePrice).toHaveBeenCalledWith('103882256', 840);
    });

    it('leaves Reverb alone when it already matches', async () => {
        const d = deps({ listing: { price: 775 } });
        expect(await handleShopifyProductUpdate({ id: 1, status: 'active', variants: [{ price: '735.00' }] }, d)).toBeNull();
        expect(d.updatePrice).not.toHaveBeenCalled();
    });

    it('skips multi-price products and drafts', async () => {
        const d = deps();
        await handleShopifyProductUpdate({ id: 1, status: 'active', variants: [{ price: '12.95' }, { price: '99.00' }] }, d);
        await handleShopifyProductUpdate({ id: 1, status: 'draft', variants: [{ price: '735.00' }] }, d);
        expect(d.updatePrice).not.toHaveBeenCalled();
    });
});

describe('checkProductAvailability', () => {
    it('reports a Reverb sale', async () => {
        expect(await checkProductAvailability('cunife-s-type', deps({ listing: { state: 'sold' } }))).toEqual({ status: 'sold-elsewhere', title: 'CuNiFe S-Type', reverbListingId: '103882256' });
    });

    it('treats live and ended listings as still available here', async () => {
        expect(await checkProductAvailability('cunife-s-type', deps())).toEqual({ status: 'available' });
        expect(await checkProductAvailability('cunife-s-type', deps({ listing: { state: 'ended' } }))).toEqual({ status: 'available' });
    });
});

describe('verifyShopifyWebhook', () => {
    it('accepts only a body signed with the secret', () => {
        const body = '{"id":1}';
        const signature = createHmac('sha256', 'secret').update(body).digest('base64');
        expect(verifyShopifyWebhook(body, signature, 'secret')).toBe(true);
        expect(verifyShopifyWebhook(body + ' ', signature, 'secret')).toBe(false);
        expect(verifyShopifyWebhook(body, signature, undefined)).toBe(false);
        expect(verifyShopifyWebhook(body, null, 'secret')).toBe(false);
    });
});
