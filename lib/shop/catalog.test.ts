import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyProduct, formatPriceRange, getAvailableProducts, HIDE_FROM_SITE_TAG, normalizeProduct, sanitizeDescriptionHtml, type ShopifyProductNode } from './catalog';

const guitarCategory = { name: 'Electric Guitars', ancestors: [{ name: 'Guitars' }, { name: 'String Instruments' }, { name: 'Musical Instruments' }] };
const ampCategory = { name: 'Guitar Amplifiers', ancestors: [{ name: 'Musical Instrument Amplifiers' }, { name: 'Musical Instrument & Orchestra Accessories' }] };
const electronicsCategory = { name: 'Circuit Boards & Components', ancestors: [{ name: 'Electronics' }] };

function node(overrides: Partial<ShopifyProductNode> = {}): ShopifyProductNode {
    return {
        handle: 'custom-assembled-s-type',
        title: 'Custom-Assembled S-Type',
        availableForSale: true,
        descriptionHtml: '<p>About this guitar.</p>',
        onlineStoreUrl: 'https://shop.k7rhy.app/products/custom-assembled-s-type',
        tags: [],
        category: guitarCategory,
        featuredImage: { url: 'https://cdn.shopify.com/front.jpg', altText: null, width: 1600, height: 2000 },
        images: {
            nodes: [
                { url: 'https://cdn.shopify.com/front.jpg', altText: null, width: 1600, height: 2000 },
                { url: 'https://cdn.shopify.com/case.jpg', altText: 'Open case', width: 1600, height: 1200 },
            ],
        },
        priceRange: { minVariantPrice: { amount: '735.0', currencyCode: 'USD' }, maxVariantPrice: { amount: '735.0', currencyCode: 'USD' } },
        variants: { nodes: [{ title: 'Default Title', availableForSale: true, price: { amount: '735.0', currencyCode: 'USD' } }] },
        ...overrides,
    };
}

describe('classifyProduct', () => {
    it('places products by their Shopify product category', () => {
        expect(classifyProduct({ category: guitarCategory, tags: [] })).toBe('guitars');
        expect(classifyProduct({ category: ampCategory, tags: [] })).toBe('amplifiers');
    });

    it('places ham radio kits by tag', () => {
        expect(classifyProduct({ category: electronicsCategory, tags: ['Amateur radio', 'Ham radio'] })).toBe('ham-radio-kits');
    });

    it('falls back to tags when the product has no category', () => {
        expect(classifyProduct({ category: null, tags: ['amplifier'] })).toBe('amplifiers');
        expect(classifyProduct({ category: null, tags: ['electric guitar'] })).toBe('guitars');
    });

    it('leaves out products it cannot place and products tagged to hide', () => {
        expect(classifyProduct({ category: { name: 'Musical Instruments', ancestors: [] }, tags: [] })).toBeNull();
        expect(classifyProduct({ category: guitarCategory, tags: [HIDE_FROM_SITE_TAG] })).toBeNull();
    });
});

describe('normalizeProduct', () => {
    it('takes price, photos, and the buy link from Shopify', () => {
        const product = normalizeProduct(node())!;
        expect(product.category).toBe('guitars');
        expect(product.priceMin).toBe(735);
        expect(product.url).toBe('https://shop.k7rhy.app/products/custom-assembled-s-type');
        expect(product.images.map((image) => image.alt)).toEqual(['Custom-Assembled S-Type', 'Open case']);
        expect(product.variants).toEqual([]);
    });

    it('keeps real variants and shows a starting price for a range', () => {
        const product = normalizeProduct(
            node({
                category: electronicsCategory,
                tags: ['Ham radio'],
                priceRange: { minVariantPrice: { amount: '12.95', currencyCode: 'USD' }, maxVariantPrice: { amount: '99.0', currencyCode: 'USD' } },
                variants: {
                    nodes: [
                        { title: 'Kit (unassembled)', availableForSale: true, price: { amount: '12.95', currencyCode: 'USD' } },
                        { title: 'Pre-assembled', availableForSale: false, price: { amount: '25.99', currencyCode: 'USD' } },
                    ],
                },
            })
        )!;
        expect(product.variants).toHaveLength(2);
        expect(formatPriceRange(product)).toBe('From $12.95');
    });

    it('falls back to the storefront URL when Shopify gives none', () => {
        expect(normalizeProduct(node({ onlineStoreUrl: null }))!.url).toBe('https://shop.k7rhy.app/products/custom-assembled-s-type');
    });
});

describe('sanitizeDescriptionHtml', () => {
    it('removes active content, editor noise, and empty spacers', () => {
        const html = '<p dir="ltr" style="color:red" onclick="x()"><span>Hello</span></p><p dir="ltr"> </p><script>alert(1)</script><!----><a href="javascript:alert(1)">bad</a>';
        expect(sanitizeDescriptionHtml(html)).toBe('<p><span>Hello</span></p><a>bad</a>');
    });

    it('never links to a serial record', () => {
        const html = '<p>See <a href="https://k7rhy.app/sn/STR26002">its record</a> or <a href="/sn/STR26001/print">the card</a>.</p>';
        const clean = sanitizeDescriptionHtml(html);
        expect(clean).not.toMatch(/\/sn\b/);
        expect(clean).toBe('<p>See its record or the card.</p>');
    });
});

describe('getAvailableProducts', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    function stubShopify(nodes: ShopifyProductNode[]) {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response(JSON.stringify({ data: { products: { nodes } } }), { status: 200 }))
        );
    }

    it('lists only items for sale in the requested category', async () => {
        stubShopify([node(), node({ handle: 'sold-guitar', availableForSale: false }), node({ handle: 'tweed-amp', category: ampCategory })]);
        const guitars = await getAvailableProducts('guitars');
        expect(guitars.unavailable).toBe(false);
        expect(guitars.products.map((product) => product.handle)).toEqual(['custom-assembled-s-type']);
        const all = await getAvailableProducts();
        expect(all.products.map((product) => product.handle)).toEqual(['custom-assembled-s-type', 'tweed-amp']);
    });

    it('reports Shopify outages instead of throwing', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('nope', { status: 503 }))
        );
        expect(await getAvailableProducts('guitars')).toEqual({ products: [], unavailable: true });
    });
});
