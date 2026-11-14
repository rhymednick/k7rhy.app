/**
 * Shopify-driven shop catalog.
 *
 * Shopify owns price, availability, photos, and descriptions. This module
 * fetches public product data and decides which shop category each product
 * belongs to. Nothing here should hold a static price or description.
 */

import type { ShopifyCategorySlug } from './categories';
import { storefrontQuery } from './storefront';

/** Add this tag to a Shopify product to keep it off k7rhy.app while still selling it on Shopify. */
export const HIDE_FROM_SITE_TAG = 'hide-from-k7rhy-app';

export interface ShopifyProductNode {
    handle: string;
    title: string;
    availableForSale: boolean;
    descriptionHtml: string;
    onlineStoreUrl: string | null;
    tags: string[];
    category: { name: string; ancestors: { name: string }[] } | null;
    featuredImage: ShopifyImageNode | null;
    images: { nodes: ShopifyImageNode[] };
    priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
    variants: { nodes: { title: string; availableForSale: boolean; price: Money }[] };
}

interface ShopifyImageNode {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
}

interface Money {
    amount: string;
    currencyCode: string;
}

export interface ShopImage {
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
}

export interface ShopVariant {
    title: string;
    available: boolean;
    price: number;
}

export interface ShopProduct {
    handle: string;
    title: string;
    category: ShopifyCategorySlug;
    available: boolean;
    priceMin: number;
    priceMax: number;
    currency: string;
    url: string;
    image: ShopImage | null;
    images: ShopImage[];
    descriptionHtml: string;
    /** Variants worth showing as choices; empty for single-variant products. */
    variants: ShopVariant[];
}

const PRODUCT_FIELDS = `
    handle
    title
    availableForSale
    descriptionHtml
    onlineStoreUrl
    tags
    category { name ancestors { name } }
    featuredImage { url altText width height }
    images(first: 20) { nodes { url altText width height } }
    priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    variants(first: 20) { nodes { title availableForSale price { amount currencyCode } } }
`;

const PRODUCTS_QUERY = `query ShopProducts { products(first: 100, sortKey: CREATED_AT, reverse: true) { nodes { ${PRODUCT_FIELDS} } } }`;
const PRODUCT_QUERY = `query ShopProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

const SHOP_ORIGIN = 'https://shop.k7rhy.app';

/**
 * Decide which site category a Shopify product belongs to, using its Shopify
 * product category (taxonomy) first and its tags as a fallback.
 */
export function classifyProduct(node: Pick<ShopifyProductNode, 'category' | 'tags'>): ShopifyCategorySlug | null {
    const tags = node.tags.map((tag) => tag.toLowerCase());
    if (tags.includes(HIDE_FROM_SITE_TAG)) {
        return null;
    }

    const names = node.category ? [node.category.name, ...node.category.ancestors.map((ancestor) => ancestor.name)].map((name) => name.toLowerCase()) : [];

    if (names.includes('musical instrument amplifiers') || names.includes('guitar amplifiers')) {
        return 'amplifiers';
    }
    if (names.includes('guitars')) {
        return 'guitars';
    }
    if (tags.includes('ham radio') || tags.includes('amateur radio')) {
        return 'ham-radio-kits';
    }
    if (tags.includes('amplifier') || tags.includes('guitar amplifier')) {
        return 'amplifiers';
    }
    if (tags.includes('guitar') || tags.includes('electric guitar')) {
        return 'guitars';
    }
    return null;
}

function toImage(node: ShopifyImageNode, fallbackAlt: string, index: number): ShopImage {
    return {
        url: node.url,
        alt: node.altText?.trim() || (index === 0 ? fallbackAlt : `${fallbackAlt}, photo ${index + 1}`),
        width: node.width,
        height: node.height,
    };
}

export function normalizeProduct(node: ShopifyProductNode): ShopProduct | null {
    const category = classifyProduct(node);
    if (!category) {
        return null;
    }

    const images = node.images.nodes.map((image, index) => toImage(image, node.title, index));
    const variants = node.variants.nodes.map((variant) => ({ title: variant.title, available: variant.availableForSale, price: Number(variant.price.amount) }));
    const hasRealVariants = variants.length > 1 || (variants.length === 1 && variants[0].title !== 'Default Title');

    return {
        handle: node.handle,
        title: node.title,
        category,
        available: node.availableForSale,
        priceMin: Number(node.priceRange.minVariantPrice.amount),
        priceMax: Number(node.priceRange.maxVariantPrice.amount),
        currency: node.priceRange.minVariantPrice.currencyCode,
        url: node.onlineStoreUrl || `${SHOP_ORIGIN}/products/${node.handle}`,
        image: node.featuredImage ? toImage(node.featuredImage, node.title, 0) : (images[0] ?? null),
        images,
        descriptionHtml: sanitizeDescriptionHtml(node.descriptionHtml),
        variants: hasRealVariants ? variants : [],
    };
}

/**
 * Clean up Shopify description HTML for display on k7rhy.app.
 *
 * The HTML comes from the owner's own Shopify admin, so this is defense in
 * depth rather than a full sanitizer: it drops active content, editor noise,
 * and any link to a serial record (serial pages are never linked from catalog
 * pages; see docs/architecture/site-organization.md).
 */
export function sanitizeDescriptionHtml(html: string): string {
    return (
        html
            // Active or embedded content.
            .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta)\b[^>]*\/?>/gi, '')
            // Comments, including the editor's empty <!----> markers.
            .replace(/<!--[\s\S]*?-->/g, '')
            // Event handlers, inline styles, and editor attributes.
            .replace(/\s(on\w+|style|dir|class|id|data-[\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
            // Unsafe link targets.
            .replace(/\shref\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\1/gi, '')
            // Links to serial records keep their text but lose the link.
            .replace(/<a\b[^>]*href\s*=\s*("|')(?:https?:\/\/(?:www\.)?k7rhy\.app)?\/sn(?:\/[^"']*)?\1[^>]*>([\s\S]*?)<\/a>/gi, '$2')
            // Empty spacer paragraphs.
            .replace(/<p>(?:\s|&nbsp;| |<br\s*\/?>)*<\/p>/gi, '')
            .trim()
    );
}

export function formatPrice(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
}

export function formatPriceRange(product: Pick<ShopProduct, 'priceMin' | 'priceMax' | 'currency'>): string {
    if (product.priceMin === product.priceMax) {
        return formatPrice(product.priceMin, product.currency);
    }
    return `From ${formatPrice(product.priceMin, product.currency)}`;
}

/** Every product the site can show, including sold ones (for direct links). */
export async function fetchCatalog(): Promise<ShopProduct[]> {
    const data = await storefrontQuery<{ products: { nodes: ShopifyProductNode[] } }>(PRODUCTS_QUERY);
    return data.products.nodes.map(normalizeProduct).filter((product): product is ShopProduct => product !== null);
}

export interface CatalogResult {
    products: ShopProduct[];
    /** True when Shopify could not be reached; pages show a fallback link instead of an empty shelf. */
    unavailable: boolean;
}

/** Products currently for sale, optionally limited to one category. */
export async function getAvailableProducts(category?: ShopifyCategorySlug): Promise<CatalogResult> {
    try {
        const products = await fetchCatalog();
        return { products: products.filter((product) => product.available && (!category || product.category === category)), unavailable: false };
    } catch (error) {
        console.error('[shop] Could not load products from Shopify:', error instanceof Error ? error.message : error);
        return { products: [], unavailable: true };
    }
}

export async function getShopProduct(handle: string): Promise<ShopProduct | null> {
    const data = await storefrontQuery<{ product: ShopifyProductNode | null }>(PRODUCT_QUERY, { handle });
    return data.product ? normalizeProduct(data.product) : null;
}
