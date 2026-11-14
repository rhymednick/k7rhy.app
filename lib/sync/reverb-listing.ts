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
    /** Blank = K7RHY Resonance Lab (my own builds). Anything else is a resold item. */
    reverbMake: string | null;
    /** Blank = the current year, for my own builds only. */
    reverbYear: string | null;
    /** A Reverb condition name, such as "Excellent". Blank = Brand New, for my own builds only. */
    reverbCondition: string | null;
    /** The actual box, "L x W x H" in inches. Blank = the category's default box. */
    reverbPackageSize: string | null;
    /** The packed weight in pounds (a number, or a Shopify weight value). Blank = the category's default weight. */
    reverbPackageWeight: string | null;
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

/**
 * Reverb's listing conditions, from GET https://api.reverb.com/api/listing_conditions
 * (fetched 2026-11-13). Keys are the display names, lowercased with only letters kept.
 */
export const REVERB_CONDITIONS: Record<string, { name: string; uuid: string }> = {
    brandnew: { name: 'Brand New', uuid: REVERB_CONDITION_BRAND_NEW },
    mint: { name: 'Mint', uuid: 'ac5b9c1e-dc78-466d-b0b3-7cf712967a48' },
    excellent: { name: 'Excellent', uuid: 'df268ad1-c462-4ba6-b6db-e007e23922ea' },
    verygood: { name: 'Very Good', uuid: 'ae4d9114-1bd7-4ec5-a4ba-6653af5ac84d' },
    good: { name: 'Good', uuid: 'f7a3f48c-972a-44c6-b01a-0cd27488d3f6' },
    fair: { name: 'Fair', uuid: '98777886-76d0-44c8-865e-bb40e669e934' },
    poor: { name: 'Poor', uuid: '6a9dfcad-600b-46c8-9e08-ce6e5057921e' },
    nonfunctioning: { name: 'Non Functioning', uuid: 'fbf35668-96a0-4baa-bcde-ab18d6b1b329' },
};

function blankToNull(value: string | null | undefined): string | null {
    return value?.trim() || null;
}

/** The make Reverb gets: the Reverb make field, or K7RHY Resonance Lab. */
export function reverbMake(fields: ReverbFields): string {
    return blankToNull(fields.reverbMake) ?? REVERB_MAKE;
}

/** True when the item is one of my own builds (make blank or K7RHY Resonance Lab). */
export function isOwnBuild(fields: ReverbFields): boolean {
    return reverbMake(fields).toLowerCase() === REVERB_MAKE.toLowerCase();
}

/** The Reverb condition named by the field, or undefined when the field doesn't name one. Blank = null. */
export function reverbCondition(fields: ReverbFields): { name: string; uuid: string } | null | undefined {
    const raw = blankToNull(fields.reverbCondition);
    if (raw === null) return null;
    return REVERB_CONDITIONS[raw.toLowerCase().replace(/[^a-z]/g, '')];
}

export interface PackageSize {
    inches: { length: number; width: number; height: number };
    pounds: number;
}

/** "44 x 17 x 6" (x, ×, or *; optional "in") → inches, or undefined when it can't be read. Blank = null. */
export function parsePackageSize(value: string | null | undefined): PackageSize['inches'] | null | undefined {
    const raw = blankToNull(value);
    if (raw === null) return null;
    const match = raw.match(/^(\d+(?:\.\d+)?)\s*(?:in|")?\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:in|")?\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:in|"|inches)?$/i);
    if (!match) return undefined;
    const [length, width, height] = match.slice(1, 4).map(Number);
    return length > 0 && width > 0 && height > 0 ? { length, width, height } : undefined;
}

/** Pounds per unit. Shopify's weight metafields use POUNDS, OUNCES, KILOGRAMS, and GRAMS. */
const POUNDS_PER_UNIT: Record<string, number> = { lb: 1, lbs: 1, pound: 1, pounds: 1, oz: 1 / 16, ounces: 1 / 16, kg: 2.20462, kilograms: 2.20462, g: 0.00220462, grams: 0.00220462 };

/** A weight in pounds from "21.5", "21.5 lb", or a Shopify weight metafield ({"value":21.5,"unit":"POUNDS"}); undefined when it can't be read. Blank = null. */
export function parsePackageWeight(value: string | null | undefined): number | null | undefined {
    const raw = blankToNull(value);
    if (raw === null) return null;
    let amount: number;
    let unit = 'lb';
    if (raw.startsWith('{')) {
        try {
            const parsed = JSON.parse(raw) as { value?: unknown; unit?: unknown };
            amount = Number(parsed.value);
            unit = String(parsed.unit ?? 'lb');
        } catch {
            return undefined;
        }
    } else {
        const match = raw.match(/^(\d+(?:\.\d+)?)\s*([a-z]*)$/i);
        if (!match) return undefined;
        amount = Number(match[1]);
        unit = match[2] || 'lb';
    }
    const factor = POUNDS_PER_UNIT[unit.toLowerCase()];
    if (!factor || !Number.isFinite(amount) || amount <= 0) return undefined;
    return Math.round(amount * factor * 10) / 10;
}

/** The box the listing ships in: the product's own size and weight fields, or the category defaults. */
export function packageFor(fields: ReverbFields): PackageSize {
    const defaults = REVERB_CATEGORY_DEFAULTS[fields.category!]!;
    return {
        inches: parsePackageSize(fields.reverbPackageSize) ?? defaults.packageInches,
        pounds: parsePackageWeight(fields.reverbPackageWeight) ?? defaults.packagePounds,
    };
}

export function describePackage(box: PackageSize): string {
    return `${box.inches.length} × ${box.inches.width} × ${box.inches.height} in, ${box.pounds} lb`;
}

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
    const condition = reverbCondition(fields);
    if (condition === undefined) {
        return `its Reverb condition "${fields.reverbCondition?.trim()}" isn't one of Reverb's (${Object.values(REVERB_CONDITIONS)
            .map((option) => option.name)
            .join(', ')})`;
    }
    if (!isOwnBuild(fields)) {
        // Only the original builder or an authorized dealer may sell as Brand New on Reverb.
        if (condition === null) {
            return `its Reverb make is "${reverbMake(fields)}", so it needs a Reverb condition (Brand New is only for my own builds)`;
        }
        if (condition.uuid === REVERB_CONDITION_BRAND_NEW) {
            return `its Reverb make is "${reverbMake(fields)}", and Brand New is only for my own builds`;
        }
        if (!blankToNull(fields.reverbYear)) {
            return `its Reverb make is "${reverbMake(fields)}", so it needs a Reverb year (the current year is only for my own builds)`;
        }
    }
    if (parsePackageSize(fields.reverbPackageSize) === undefined) {
        return `its Reverb package size "${fields.reverbPackageSize?.trim()}" isn't "L x W x H" in inches`;
    }
    if (parsePackageWeight(fields.reverbPackageWeight) === undefined) {
        return `its Reverb package weight "${fields.reverbPackageWeight?.trim()}" isn't a weight in pounds`;
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
    const ownBuild = isOwnBuild(fields);
    const base: Record<string, unknown> = {
        make: reverbMake(fields),
        model: fields.reverbModel?.trim() || product.title || fields.title,
        ...(fields.reverbFinish?.trim() ? { finish: fields.reverbFinish.trim() } : {}),
        year: blankToNull(fields.reverbYear) ?? String(now.getFullYear()),
        title: product.title || fields.title,
        description: reverbDescription(product.body_html),
        condition: { uuid: reverbCondition(fields)?.uuid ?? REVERB_CONDITION_BRAND_NEW },
        categories: [{ uuid: defaults.reverbCategoryUuid }],
        photos: (product.images ?? []).map((image) => image.src).filter(Boolean),
        price: { amount: reverbPriceFor(price).toFixed(2), currency: 'USD' },
        has_inventory: false,
        offers_enabled: true,
        // Someone else's factory gear is never handmade by me, whatever its category.
        handmade: defaults.handmade && ownBuild,
        sku: skuForProduct(product.id),
        upc_does_not_apply: 'true',
    };
    const box = packageFor(fields);
    const { length, width, height } = box.inches;
    return {
        live: {
            ...base,
            shipping: { local: false, rates: [{ region_code: 'US_CON', carrier_calculated: true }] },
            package: {
                length: { value: length, unit: 'in' },
                width: { value: width, unit: 'in' },
                height: { value: height, unit: 'in' },
                weight: { value: box.pounds, unit: 'lb' },
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
