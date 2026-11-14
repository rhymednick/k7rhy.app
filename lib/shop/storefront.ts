/**
 * Minimal Shopify Storefront API client.
 *
 * Product listings are public, so the Storefront API answers these queries
 * without a token. If SHOPIFY_STOREFRONT_ACCESS_TOKEN is set, it is sent as
 * well (server-side only; never NEXT_PUBLIC_ and never logged).
 */

export const SHOPIFY_API_VERSION = '2025-01';
export const DEFAULT_SHOPIFY_STORE_DOMAIN = 'k7rhy.myshopify.com';

/** Seconds a fetched Shopify response stays fresh before the next request refetches it. */
export const SHOP_REVALIDATE_SECONDS = 300;

export function storefrontEndpoint(domain = process.env.SHOPIFY_STORE_DOMAIN || DEFAULT_SHOPIFY_STORE_DOMAIN): string {
    return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

export class StorefrontError extends Error {}

export async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    if (token) {
        headers['X-Shopify-Storefront-Access-Token'] = token;
    }

    const response = await fetch(storefrontEndpoint(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        next: { revalidate: SHOP_REVALIDATE_SECONDS, tags: ['shopify'] },
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
