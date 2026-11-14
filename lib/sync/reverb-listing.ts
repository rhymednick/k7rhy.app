/**
 * Builds a Reverb listing from a Shopify product. Shopify is the hub: the
 * title, description, photos, and price come from Shopify; Reverb-only details
 * come from the product's custom fields or the defaults below.
 * See docs/engineering/listing-runbook.md.
 */

import { sanitizeDescriptionHtml } from '@/lib/shop/catalog';
import type { ShopifyCategorySlug } from '@/lib/shop/categories';
import { reverbPriceFor } from './price-rule';

/** A Shopify product as Shopify's product webhooks send it (REST format). */
export interface ShopifyProductPayload {
    id: number | string;
    title?: string;
    body_html?: string | null;
    status?: string;
    variants?: { price?: string | number; inventory_quantity?: number | null }[];
    images?: { src?: string }[];
}

/** The product's custom fields that drive the Reverb listing. */
export interface ReverbFields {
    handle: string;
    title: string;
    category: ShopifyCategorySlug | null;
    /** true = on, false = explicitly off (ends the listing), null = never set (keeps an existing listing, creates nothing). */
    listOnReverb: boolean | null;
    reverbListingId: string | null;
    reverbModel: string | null;
    reverbFinish: string | null;
}

interface CategoryDefaults {
    reverbCategoryUuid: string;
    handmade: boolean;
    packageInches: { length: number; width: number; height: number };
    packagePounds: number;
}

/** Only these Shopify categories can be listed on Reverb automatically. */
export const REVERB_CATEGORY_DEFAULTS: Partial<Record<ShopifyCategorySlug, CategoryDefaults>> = {
    // Electric Guitars / Solid Body. Guitars on factory bodies are never "handmade" (owner rule).
    guitars: { reverbCategoryUuid: 'e57deb7a-382b-4e18-a008-67d4fbcb2879', handmade: false, packageInches: { length: 44, width: 17, height: 6 }, packagePounds: 19 },
    // Amps / Guitar Amps / Guitar Combos. Hand-wired amps are handmade.
    amplifiers: { reverbCategoryUuid: '10335451-31e5-418a-8ed8-f48cd738f17d', handmade: true, packageInches: { length: 21, width: 21, height: 11 }, packagePounds: 39.5 },
};

export const REVERB_MAKE = 'K7RHY Resonance Lab';
export const REVERB_CONDITION_BRAND_NEW = '7c3f45de-2ae0-4c81-8400-fdb6b1d74890';

/** The Reverb SKU that ties a listing to its Shopify product. */
export function skuForProduct(productId: number | string): string {
    return `shopify-${String(productId).replace(/^gid:\/\/shopify\/Product\//, '')}`;
}

export function shopifyPrice(product: ShopifyProductPayload): number | null {
    const prices = (product.variants ?? []).map((variant) => Number(variant.price)).filter((price) => Number.isFinite(price) && price > 0);
    // One-off items have a single price; a product with several prices isn't a Reverb candidate.
    return prices.length > 0 && new Set(prices).size === 1 ? prices[0] : null;
}

/** Total stock, or null when Shopify didn't say. */
export function shopifyStock(product: ShopifyProductPayload): number | null {
    const counts = (product.variants ?? []).map((variant) => variant.inventory_quantity).filter((count): count is number => typeof count === 'number');
    return counts.length > 0 ? counts.reduce((sum, count) => sum + count, 0) : null;
}

/** Why a product can't be listed, or null when it can. */
export function cannotListReason(product: ShopifyProductPayload, fields: ReverbFields): string | null {
    if (!fields.category || !REVERB_CATEGORY_DEFAULTS[fields.category]) {
        return "its Shopify category isn't a guitar or amplifier category, so I don't know its Reverb category";
    }
    if (shopifyPrice(product) === null) {
        return 'it has no single price (one-off items only)';
    }
    if (!(product.images ?? []).some((image) => image.src)) {
        return 'it has no photos';
    }
    return null;
}

export interface ListingBodies {
    /** Live listing with calculated shipping (the format Reverb shows on existing listings). */
    live: Record<string, unknown>;
    /** Draft without shipping, used if Reverb rejects the calculated-shipping fields. */
    draft: Record<string, unknown>;
}

export function buildReverbListing(product: ShopifyProductPayload, fields: ReverbFields, now = new Date()): ListingBodies {
    const defaults = REVERB_CATEGORY_DEFAULTS[fields.category!]!;
    const price = shopifyPrice(product)!;
    const base: Record<string, unknown> = {
        make: REVERB_MAKE,
        model: fields.reverbModel?.trim() || product.title || fields.title,
        ...(fields.reverbFinish?.trim() ? { finish: fields.reverbFinish.trim() } : {}),
        year: String(now.getFullYear()),
        title: product.title || fields.title,
        description: reverbDescription(product.body_html),
        condition: { uuid: REVERB_CONDITION_BRAND_NEW },
        categories: [{ uuid: defaults.reverbCategoryUuid }],
        photos: (product.images ?? []).map((image) => image.src).filter(Boolean),
        price: { amount: reverbPriceFor(price).toFixed(2), currency: 'USD' },
        has_inventory: false,
        offers_enabled: true,
        handmade: defaults.handmade,
        sku: skuForProduct(product.id),
        upc_does_not_apply: 'true',
    };
    const { length, width, height } = defaults.packageInches;
    return {
        live: {
            ...base,
            shipping: { local: false, rates: [{ region_code: 'US_CON', carrier_calculated: true }] },
            package: {
                length: { value: length, unit: 'in' },
                width: { value: width, unit: 'in' },
                height: { value: height, unit: 'in' },
                weight: { value: defaults.packagePounds, unit: 'lb' },
            },
            publish: true,
        },
        draft: { ...base, publish: false },
    };
}

/**
 * The Shopify description as Reverb receives it: sanitized, with every link
 * unwrapped to its text. Reverb listings can't send buyers off Reverb, so links
 * that belong on the website (to Relay pages, serial records, and so on) stay
 * on Shopify and k7rhy.app only.
 */
export function reverbDescription(html: string | undefined | null): string {
    return sanitizeDescriptionHtml(html ?? '')
        .replace(/<a\b[^>]*>/gi, '')
        .replace(/<\/a\s*>/gi, '');
}

/** Plain text of an HTML description, for comparing Shopify's copy with Reverb's. */
export function descriptionText(html: string | undefined | null): string {
    return (html ?? '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}
