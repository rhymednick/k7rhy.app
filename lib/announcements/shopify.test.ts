// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { normalizeListing } from './shopify';

const node = { id: 'gid://shopify/Product/123', handle: 'test', title: 'Guitar', description: 'Description', onlineStoreUrl: 'https://shop.k7rhy.app/products/test', availableForSale: true, tags: ['guitar', 'discord-ready'], category: null, variants: { nodes: [{ quantityAvailable: 1, price: { amount: '799', currencyCode: 'USD' } }] }, summary: { value: 'Approved description.\n\nSecond paragraph.' }, record: { value: 'https://k7rhy.app/sn/STR26001' }, related: { value: '["https://k7rhy.app/sn/STR26001/wiring"]' } };
describe('announcement eligibility and links', () => {
    it('uses explicit record and related URLs without fabricating a serial', () => {
        expect(normalizeListing(node)?.links).toContainEqual({ label: 'Instrument record', url: node.record.value });
        expect(normalizeListing({ ...node, record: null })?.links.some((link) => link.label === 'Instrument record')).toBe(false);
    });
    it('requires explicit approved copy and never falls back to the Shopify description', () => {
        expect(normalizeListing({ ...node, summary: null })).toBeNull();
        expect(normalizeListing({ ...node, summary: { value: '   \n ' } })).toBeNull();
        expect(normalizeListing({ ...node, summary: { value: '<br>' } })).toBeNull();
        expect(normalizeListing(node)?.description).toBe(node.summary.value);
    });
    it('rejects long approval copy instead of silently truncating it', () => {
        expect(() => normalizeListing({ ...node, summary: { value: 'a'.repeat(651) } })).toThrow('shorten and approve');
        expect(normalizeListing({ ...node, summary: { value: 'a'.repeat(650) } })?.description).toHaveLength(650);
    });
    it('excludes ham products, hidden listings, multiple variants, overselling, and unpublished listings', () => {
        expect(normalizeListing({ ...node, tags: ['Ham radio'] })).toBeNull();
        expect(normalizeListing({ ...node, tags: ['guitar', 'hide-from-k7rhy-app'] })).toBeNull();
        expect(normalizeListing({ ...node, variants: { nodes: [...node.variants.nodes, ...node.variants.nodes] } })).toBeNull();
        expect(normalizeListing({ ...node, variants: { nodes: [{ ...node.variants.nodes[0], quantityAvailable: 0 }] } })?.available).toBe(false);
        expect(normalizeListing({ ...node, onlineStoreUrl: null })?.available).toBe(false);
    });
    it('rejects unsafe and excessive links', () => {
        expect(() => normalizeListing({ ...node, related: { value: '["javascript:alert(1)"]' } })).toThrow();
        expect(() => normalizeListing({ ...node, record: { value: 'https://example.com/sn/123' } })).toThrow();
        expect(() => normalizeListing({ ...node, related: { value: '["https://a.com","https://b.com","https://c.com","https://d.com"]' } })).toThrow();
    });
});
