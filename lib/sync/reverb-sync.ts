/**
 * Shopify ↔ Reverb sync rules.
 *
 * Reverb leads on price; this sync never changes a Reverb price. Each Shopify product that is also
 * listed on Reverb carries the Reverb listing number in the custom field
 * custom.reverb_listing_id. Nothing here polls: every action is triggered by a
 * Shopify webhook or by someone opening the product page on k7rhy.app.
 * See docs/decisions/2026-11-13-reverb-shopify-sync.md.
 */

import { getReverbListing, endReverbListing, reverbListingUrl, isReverbListingId, hasReverbToken, type ReverbListing } from '@/lib/reverb/client';
import { canReadMetafields, storefrontQuery } from '@/lib/shop/storefront';
import { sendSalesAlert } from './alert';

export interface ReverbLink {
    handle: string;
    title: string;
    reverbListingId: string | null;
}

export interface SyncDeps {
    lookupByProductId(productId: string): Promise<ReverbLink | null>;
    lookupByHandle(handle: string): Promise<ReverbLink | null>;
    getListing(id: string): Promise<ReverbListing>;
    endListing(id: string): Promise<void>;
    canWriteReverb(): boolean;
    alert(message: string): Promise<void>;
}

const LINK_FIELDS = `handle title reverb: metafield(namespace: "custom", key: "reverb_listing_id") { value }`;

async function lookup(query: string, variables: Record<string, unknown>): Promise<ReverbLink | null> {
    if (!canReadMetafields()) {
        return null;
    }
    const data = await storefrontQuery<{ product: { handle: string; title: string; reverb: { value: string } | null } | null }>(query, variables, { fresh: true });
    if (!data.product) {
        return null;
    }
    const value = data.product.reverb?.value?.trim() ?? null;
    return { handle: data.product.handle, title: data.product.title, reverbListingId: isReverbListingId(value) ? value : null };
}

export const liveDeps: SyncDeps = {
    lookupByProductId: (productId) => lookup(`query ($id: ID!) { product(id: $id) { ${LINK_FIELDS} } }`, { id: productId.startsWith('gid://') ? productId : `gid://shopify/Product/${productId}` }),
    lookupByHandle: (handle) => lookup(`query ($handle: String!) { product(handle: $handle) { ${LINK_FIELDS} } }`, { handle }),
    getListing: getReverbListing,
    endListing: endReverbListing,
    canWriteReverb: hasReverbToken,
    alert: sendSalesAlert,
};

interface ShopifyOrder {
    name?: string;
    line_items?: { product_id?: number | string | null; title?: string }[];
}

/** A Shopify order came in: end the matching Reverb listings, or flag a double sale. */
export async function handleShopifyOrder(order: ShopifyOrder, deps: SyncDeps = liveDeps): Promise<string[]> {
    const results: string[] = [];
    const orderName = order.name ?? 'a Shopify order';
    const productIds = [...new Set((order.line_items ?? []).map((item) => item.product_id).filter((id): id is number | string => id !== null && id !== undefined))];

    for (const productId of productIds) {
        const link = await deps.lookupByProductId(String(productId));
        if (!link?.reverbListingId) {
            continue;
        }
        const id = link.reverbListingId;
        try {
            const listing = await deps.getListing(id);
            if (listing.state === 'sold') {
                const message = `⚠️ Double sale: "${link.title}" was bought on Shopify (${orderName}), but it already sold on Reverb. Cancel and refund ${orderName} before shipping. ${reverbListingUrl(id)}`;
                await deps.alert(message);
                results.push(message);
            } else if (listing.state === 'live') {
                if (!deps.canWriteReverb()) {
                    const message = `"${link.title}" sold on Shopify (${orderName}). End the Reverb listing by hand: ${reverbListingUrl(id)} (REVERB_API_TOKEN isn't set).`;
                    await deps.alert(message);
                    results.push(message);
                    continue;
                }
                await deps.endListing(id);
                const message = `✅ "${link.title}" sold on Shopify (${orderName}). I ended its Reverb listing. End the Facebook listing by hand.`;
                await deps.alert(message);
                results.push(message);
            }
        } catch (error) {
            const message = `⚠️ "${link.title}" sold on Shopify (${orderName}), but I couldn't end its Reverb listing. End it by hand: ${reverbListingUrl(id)} (${error instanceof Error ? error.message : 'unknown error'})`;
            await deps.alert(message);
            results.push(message);
        }
    }
    return results;
}

export type PageAvailability = { status: 'available' } | { status: 'sold-elsewhere'; title: string; reverbListingId: string };

/** Someone opened a product page: make sure the item hasn't already sold on Reverb. */
export async function checkProductAvailability(handle: string, deps: SyncDeps = liveDeps): Promise<PageAvailability> {
    const link = await deps.lookupByHandle(handle);
    if (!link?.reverbListingId) {
        return { status: 'available' };
    }
    const listing = await deps.getListing(link.reverbListingId);
    // Only a Reverb sale blocks the page. An ended listing (taken down by hand, or by this sync) doesn't mean it sold.
    return listing.state === 'sold' ? { status: 'sold-elsewhere', title: link.title, reverbListingId: link.reverbListingId } : { status: 'available' };
}
