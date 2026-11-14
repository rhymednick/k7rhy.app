import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { ReverbListing } from '@/lib/reverb/client';
import { reverbPriceFor } from './price-rule';
import { buildReverbListing, skuForProduct, type ReverbFields, type ShopifyProductPayload } from './reverb-listing';
import { checkProductAvailability, handleShopifyOrder, handleShopifyProduct, handleShopifyProductDelete, type SyncDeps } from './reverb-sync';
import { verifyShopifyWebhook } from './shopify-webhook';

const PRODUCT_ID = '15437136035997';

function fields(overrides: Partial<ReverbFields> = {}): ReverbFields & { productId: string } {
    return { productId: PRODUCT_ID, handle: 'cunife-s-type', title: 'CuNiFe S-Type', category: 'guitars', listOnReverb: true, reverbListingId: '103882256', reverbModel: 'CuNiFe S-Type', reverbFinish: 'Gloss White', ...overrides };
}

function product(overrides: Partial<ShopifyProductPayload> = {}): ShopifyProductPayload {
    return { id: PRODUCT_ID, title: 'CuNiFe S-Type', body_html: '<p>About this guitar.</p>', status: 'active', variants: [{ price: '735.00', inventory_quantity: 1 }], images: [{ src: 'https://cdn.shopify.com/front.jpg' }], ...overrides };
}

type TestDeps = SyncDeps & { alerts: string[] };

function deps(opts: { listing?: Partial<ReverbListing>; fields?: (ReverbFields & { productId: string }) | null; skuIds?: string[]; overrides?: Partial<SyncDeps> } = {}): TestDeps {
    const alerts: string[] = [];
    const listing: ReverbListing = { id: '103882256', state: 'live', price: 775, currency: 'USD', inventory: 1, title: 'CuNiFe S-Type', description: '<p>About this guitar.</p>', ...opts.listing };
    return {
        alerts,
        lookupFields: vi.fn(async () => (opts.fields === undefined ? fields() : opts.fields)),
        findListingIdsBySku: vi.fn(async () => opts.skuIds ?? []),
        getListing: vi.fn(async () => listing),
        createListing: vi.fn(async () => '200000001'),
        updateListing: vi.fn(async () => {}),
        endListing: vi.fn(async () => {}),
        relistListing: vi.fn(async () => {}),
        canWriteReverb: () => true,
        alert: vi.fn(async (message: string) => {
            alerts.push(message);
        }),
        ...opts.overrides,
    };
}

describe('reverbPriceFor', () => {
    it('adds 5% and rounds up to the next $5', () => {
        expect(reverbPriceFor(735)).toBe(775);
        expect(reverbPriceFor(799)).toBe(840);
        expect(reverbPriceFor(1020)).toBe(1075);
    });
});

describe('buildReverbListing', () => {
    it('maps a Shopify guitar onto Reverb defaults', () => {
        const { live, draft } = buildReverbListing(product(), fields(), new Date('2026-11-13'));
        expect(live).toMatchObject({
            make: 'K7RHY Resonance Lab',
            model: 'CuNiFe S-Type',
            finish: 'Gloss White',
            year: '2026',
            handmade: false,
            sku: skuForProduct(PRODUCT_ID),
            price: { amount: '775.00', currency: 'USD' },
            categories: [{ uuid: 'e57deb7a-382b-4e18-a008-67d4fbcb2879' }],
            photos: ['https://cdn.shopify.com/front.jpg'],
            publish: true,
        });
        expect(live.shipping).toBeDefined();
        expect(draft).toMatchObject({ publish: false });
        expect(draft.shipping).toBeUndefined();
    });

    it('marks amps handmade', () => {
        expect(buildReverbListing(product(), fields({ category: 'amplifiers' })).live.handmade).toBe(true);
    });
});

describe('handleShopifyProduct', () => {
    it('creates a live Reverb listing when "List on Reverb" is turned on', async () => {
        const d = deps({ fields: fields({ reverbListingId: null }), skuIds: [] });
        let calls = 0;
        d.findListingIdsBySku = vi.fn(async () => (calls++ < 2 ? [] : ['200000001']));
        await handleShopifyProduct(product(), d);
        expect(d.createListing).toHaveBeenCalledTimes(1);
        expect(vi.mocked(d.createListing).mock.calls[0][0]).toMatchObject({ publish: true });
        expect(d.alerts[0]).toMatch(/Listed "CuNiFe S-Type" on Reverb at \$775/);
    });

    it('falls back to a draft when Reverb rejects calculated shipping', async () => {
        const d = deps({ fields: fields({ reverbListingId: null }) });
        d.createListing = vi.fn().mockRejectedValueOnce(new Error('422 shipping invalid')).mockResolvedValueOnce('200000002');
        await handleShopifyProduct(product(), d);
        expect(vi.mocked(d.createListing).mock.calls[1][0]).toMatchObject({ publish: false });
        expect(d.alerts[0]).toMatch(/as a draft/);
    });

    it('does nothing for products that are not opted in', async () => {
        const d = deps({ fields: fields({ reverbListingId: null, listOnReverb: false }) });
        expect(await handleShopifyProduct(product(), d)).toBeNull();
        expect(d.createListing).not.toHaveBeenCalled();
    });

    it('keeps syncing an existing listing whose "List on Reverb" was never set', async () => {
        const d = deps({ fields: fields({ listOnReverb: null }), listing: { price: 845 } });
        await handleShopifyProduct(product({ variants: [{ price: '799.00', inventory_quantity: 1 }] }), d);
        expect(d.endListing).not.toHaveBeenCalled();
        expect(d.updateListing).toHaveBeenCalledWith('103882256', expect.objectContaining({ price: { amount: '840.00', currency: 'USD' } }));
    });

    it('ends an existing listing when "List on Reverb" is switched off', async () => {
        const d = deps({ fields: fields({ listOnReverb: false }) });
        await handleShopifyProduct(product(), d);
        expect(d.endListing).toHaveBeenCalledWith('103882256');
    });

    it('never creates a listing when "List on Reverb" was never set', async () => {
        const d = deps({ fields: fields({ reverbListingId: null, listOnReverb: null }) });
        expect(await handleShopifyProduct(product(), d)).toBeNull();
        expect(d.createListing).not.toHaveBeenCalled();
    });

    it('explains why an opted-in product cannot be listed', async () => {
        const d = deps({ fields: fields({ reverbListingId: null, category: 'ham-radio-kits' }) });
        await handleShopifyProduct(product(), d);
        expect(d.createListing).not.toHaveBeenCalled();
        expect(d.alerts[0]).toMatch(/can't list it/);
    });

    it('moves the Reverb price when the Shopify price changes', async () => {
        const d = deps({ listing: { price: 845 } });
        await handleShopifyProduct(product({ variants: [{ price: '799.00', inventory_quantity: 1 }] }), d);
        expect(d.updateListing).toHaveBeenCalledWith('103882256', expect.objectContaining({ price: { amount: '840.00', currency: 'USD' } }));
    });

    it('stays quiet when Reverb already matches', async () => {
        const d = deps();
        expect(await handleShopifyProduct(product(), d)).toBeNull();
        expect(d.updateListing).not.toHaveBeenCalledWith('103882256', expect.objectContaining({ price: expect.anything() }));
    });

    it('ends the listing when the product goes to Draft, even though Shopify then hides it', async () => {
        const d = deps({ fields: null, skuIds: ['103882256'] });
        await handleShopifyProduct(product({ status: 'draft' }), d);
        expect(d.endListing).toHaveBeenCalledWith('103882256');
        expect(d.alerts[0]).toMatch(/draft in Shopify/);
    });

    it('ends the listing when it sells out in Shopify', async () => {
        const d = deps();
        await handleShopifyProduct(product({ variants: [{ price: '735.00', inventory_quantity: 0 }] }), d);
        expect(d.endListing).toHaveBeenCalledWith('103882256');
    });

    it('relists an ended listing when the product is active again', async () => {
        const d = deps({ listing: { state: 'ended' } });
        await handleShopifyProduct(product(), d);
        expect(d.relistListing).toHaveBeenCalledWith('103882256');
    });

    it('never touches a listing that sold on Reverb', async () => {
        const d = deps({ listing: { state: 'sold' } });
        await handleShopifyProduct(product({ status: 'archived' }), d);
        expect(d.endListing).not.toHaveBeenCalled();
        expect(d.relistListing).not.toHaveBeenCalled();
    });

    it('writes the SKU onto a hand-made listing found through the listing ID field', async () => {
        const d = deps({ skuIds: [] });
        await handleShopifyProduct(product(), d);
        expect(d.updateListing).toHaveBeenCalledWith('103882256', { sku: skuForProduct(PRODUCT_ID) });
    });

    it("ignores Shopify's sample product", async () => {
        const d = deps();
        expect(await handleShopifyProduct(product({ id: '788032119674292922' }), d)).toBeNull();
        expect(d.lookupFields).not.toHaveBeenCalled();
    });
});

describe('handleShopifyProductDelete', () => {
    it('ends the listing of a deleted product', async () => {
        const d = deps({ skuIds: ['103882256'] });
        await handleShopifyProductDelete({ id: PRODUCT_ID }, d);
        expect(d.endListing).toHaveBeenCalledWith('103882256');
    });
});

describe('handleShopifyOrder', () => {
    const order = { name: '#1042', line_items: [{ product_id: Number(PRODUCT_ID), title: 'CuNiFe S-Type' }] };

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
        const d = deps({ overrides: { endListing: vi.fn(async () => Promise.reject(new Error('offer pending'))) } });
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
            expect(d.endListing).not.toHaveBeenCalled();
            expect(d.alerts[0]).toMatch(/Ignored a Shopify test notification/);
        }
        const d = deps();
        await handleShopifyOrder(order, d, { testHeader: 'true' });
        expect(d.endListing).not.toHaveBeenCalled();
    });

    it('ignores products with no Reverb listing', async () => {
        const d = deps({ fields: fields({ reverbListingId: null }), skuIds: [] });
        expect(await handleShopifyOrder(order, d)).toEqual([]);
        expect(d.getListing).not.toHaveBeenCalled();
    });
});

describe('checkProductAvailability', () => {
    it('reports a Reverb sale', async () => {
        expect(await checkProductAvailability('cunife-s-type', deps({ listing: { state: 'sold' } }))).toEqual({ status: 'sold-elsewhere', title: 'CuNiFe S-Type', reverbListingId: '103882256' });
    });

    it('finds listings the site created through their SKU', async () => {
        const d = deps({ fields: fields({ reverbListingId: null }), skuIds: ['200000001'], listing: { state: 'sold' } });
        expect(await checkProductAvailability('cunife-s-type', d)).toMatchObject({ status: 'sold-elsewhere', reverbListingId: '200000001' });
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
    });
});
