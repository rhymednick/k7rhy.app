/**
 * Shop categories on k7rhy.app.
 *
 * Shopify owns every listed item. These categories only decide where an item
 * appears on the site; see docs/decisions/2026-11-13-shopify-driven-shop.md.
 */

export const SHOPIFY_CATEGORIES = ['guitars', 'amplifiers', 'ham-radio-kits'] as const;
export type ShopifyCategorySlug = (typeof SHOPIFY_CATEGORIES)[number];

/** Coupeville is special-order only, so it has a shop page but no Shopify listings. */
export type ShopCategorySlug = ShopifyCategorySlug | 'coupeville';

export const SHOP_CATEGORY_SLUGS: ShopCategorySlug[] = [...SHOPIFY_CATEGORIES, 'coupeville'];

export interface ShopCategoryInfo {
    slug: ShopCategorySlug;
    title: string;
    description: string;
    emptyMessage: string;
}

export const shopCategories: Record<ShopCategorySlug, ShopCategoryInfo> = {
    guitars: {
        slug: 'guitars',
        title: 'Guitars',
        description: "Guitars I've assembled, wired, and set up, ready to play. Each one is a single instrument, so when it sells, it's gone.",
        emptyMessage: 'No guitars are available right now.',
    },
    amplifiers: {
        slug: 'amplifiers',
        title: 'Amplifiers',
        description: "Tube amplifiers I've built and tested one at a time, each with its own build record.",
        emptyMessage: 'No amplifiers are available right now.',
    },
    'ham-radio-kits': {
        slug: 'ham-radio-kits',
        title: 'Ham Radio Kits',
        description: 'Electronics kits for amateur radio operators.',
        emptyMessage: 'No ham radio kits are available right now.',
    },
    coupeville: {
        slug: 'coupeville',
        title: 'Coupeville',
        description: 'Instruments I build by hand, one at a time.',
        emptyMessage: '',
    },
};

export function isShopCategorySlug(value: string): value is ShopCategorySlug {
    return (SHOP_CATEGORY_SLUGS as string[]).includes(value);
}

export function isShopifyCategorySlug(value: string): value is ShopifyCategorySlug {
    return (SHOPIFY_CATEGORIES as readonly string[]).includes(value);
}
