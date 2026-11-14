/**
 * Minimal Shopify Storefront API client.
 *
 * Product listings are public, so the Storefront API answers catalog queries
 * without a token. Custom fields (metafields), such as the Reverb listing ID,
 * need the Headless channel's Storefront token in SHOPIFY_STOREFRONT_ACCESS_TOKEN.
 * The token is sent from the server only and never logged.
 */

export const SHOPIFY_API_VERSION = '2025-01';
export const DEFAULT_SHOPIFY_STORE_DOMAIN = 'k7rhy.myshopify.com';

/** Seconds a fetched Shopify response stays fresh before the next request refetches it. */
export const SHOP_REVALIDATE_SECONDS = 300;

export function storefrontEndpoint(domain = process.env.SHOPIFY_STORE_DOMAIN || DEFAULT_SHOPIFY_STORE_DOMAIN): string {
    return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

export class StorefrontError extends Error {}

function storefrontToken(): string | undefined {
    // The older NEXT_PUBLIC_ name still exists in the Netlify environment; accept it so the token isn't needed twice.
    return process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN || undefined;
}

/** Custom fields (metafields) can only be read with a Storefront token. */
export function canReadMetafields(): boolean {
    return Boolean(storefrontToken());
}

interface StorefrontQueryOptions {
    /** Skip the 5-minute cache, for webhook handlers that need the current state. */
    fresh?: boolean;
}

export async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}, options: StorefrontQueryOptions = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = storefrontToken();
    if (token) {
        headers['X-Shopify-Storefront-Access-Token'] = token;
    }

    const response = await fetch(storefrontEndpoint(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        ...(options.fresh ? { cache: 'no-store' as const } : { next: { revalidate: SHOP_REVALIDATE_SECONDS, tags: ['shopify'] } }),
    });

    if (!response.ok) {
        throw new StorefrontError(`Shopify Storefront API returned ${response.status}`);
    }

    const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
    if (body.errors?.length) {
        throw new StorefrontError(`Shopify Storefront API error: ${body.errors.map((error) => error.message).join('; ')}`);
    }
    if (!body.data) {
        throw new StorefrontError('Shopify Storefront API returned no data');
    }
    return body.data;
}
