// lib/shopify.ts
import { createStorefrontApiClient, type StorefrontApiClient } from '@shopify/storefront-api-client';

const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_PUBLIC_STOREFRONT_ACCESS_TOKEN + '';
const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN + '';

if (!storefrontAccessToken || !storeDomain) {
    throw new Error('Missing Shopify Storefront API access token or store domain.');
}
console.log('storefrontAccessToken', storefrontAccessToken);
console.log('storeDomain', storeDomain);
const client = createStorefrontApiClient({
    storeDomain: storeDomain,
    publicAccessToken: storefrontAccessToken,
    apiVersion: '2024-07',
});

export const shopifyClient: StorefrontApiClient = client;
