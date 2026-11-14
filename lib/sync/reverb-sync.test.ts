import { describe, expect, it, vi } from 'vitest';
import type { ReverbListing } from '@/lib/reverb/client';
import { shopifyPriceFor } from './price-rule';
import { checkProductAvailability, handleShopifyOrder, type SyncDeps } from './reverb-sync';
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
        canWriteReverb: () => true,
        alert: vi.fn(async (message: string) => {
            alerts.push(message);
        }),
        ...overrides,
    };
}

describe('shopifyPriceFor', () => {
    it('takes 5% off the Reverb price and rounds down to $5', () => {
        expect(shopifyPriceFor(775)).toBe(735);
        expect(shopifyPriceFor(1075)).toBe(1020);
        expect(shopifyPriceFor(845)).toBe(800);
        expect(shopifyPriceFor(100)).toBe(95);
    });

    it('rejects nonsense prices', () => {
        expect(() => shopifyPriceFor(0)).toThrow();
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

    it('never touches Reverb for a Shopify test notification', async () => {
        for (const testOrder of [
            { ...order, test: true },
            { ...order, name: '#9999' },
            { ...order, email: 'jon@example.com' },
        ]) {
            const d = deps();
            await handleShopifyOrder(testOrder, d);
            expect(d.lookupByProductId).not.toHaveBeenCalled();
            expect(d.endListing).not.toHaveBeenCalled();
            expect(d.alerts[0]).toMatch(/Ignored a Shopify test notification/);
        }
        const d = deps();
        await handleShopifyOrder(order, d, { testHeader: 'true' });
        expect(d.endListing).not.toHaveBeenCalled();
    });

    it('ignores products with no Reverb listing', async () => {
        const d = deps({ lookupByProductId: vi.fn(async () => ({ handle: 'kit', title: 'Kit', reverbListingId: null })) });
        expect(await handleShopifyOrder(order, d)).toEqual([]);
        expect(d.getListing).not.toHaveBeenCalled();
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
