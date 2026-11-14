/**
 * Shopify → Reverb sync. Shopify is the hub (owner, 2026-11-13).
 *
 * - Product created/updated in Shopify with "List on Reverb" on → create or
 *   update the Reverb listing (price = Shopify + 5%, rounded up to $5).
 * - Product set to Draft/Archived, sold out, switched off, or deleted → end
 *   the Reverb listing (no-fee "not sold" end). Back to Active → relist.
 * - Shopify order → end the Reverb listing, or flag a double sale.
 * - Product page opened on k7rhy.app → check Reverb hasn't sold it.
 *
 * A listing is found by its Reverb SKU (shopify-<product id>) or, for
 * listings made by hand, the product's Reverb listing ID field. Nothing polls.
 * See docs/decisions/2026-11-13-reverb-shopify-sync.md.
 */

import { createReverbListing, endReverbListing, findReverbListingIdsBySku, getReverbListing, hasReverbToken, isReverbListingId, relistReverbListing, reverbListingUrl, updateReverbListing, type ReverbListing } from '@/lib/reverb/client';
import { classifyProduct } from '@/lib/shop/catalog';
import { canReadMetafields, storefrontQuery } from '@/lib/shop/storefront';
import { sendSalesAlert } from './alert';
import { reverbPriceFor } from './price-rule';
import { buildReverbListing, cannotListReason, describePackage, descriptionText, packageFor, reverbDescription, shopifyPrice, shopifyStock, skuForProduct, type ReverbFields, type ShopifyProductPayload } from './reverb-listing';

export interface SyncDeps {
    /** The product's Reverb fields from Shopify, or null when Shopify won't show the product (Draft, Archived, unpublished). */
    lookupFields(by: { productId: string } | { handle: string }): Promise<(ReverbFields & { productId: string }) | null>;
    findListingIdsBySku(sku: string): Promise<string[]>;
    getListing(id: string): Promise<ReverbListing>;
    createListing(body: Record<string, unknown>): Promise<string>;
    updateListing(id: string, fields: Record<string, unknown>): Promise<void>;
    endListing(id: string): Promise<void>;
    relistListing(id: string): Promise<void>;
    canWriteReverb(): boolean;
    alert(message: string): Promise<void>;
}

const FIELD_QUERY = `
    id handle title
    category { name ancestors { name } }
    tags
    listOnReverb: metafield(namespace: "custom", key: "list_on_reverb") { value }
    reverbListingId: metafield(namespace: "custom", key: "reverb_listing_id") { value }
    reverbModel: metafield(namespace: "custom", key: "reverb_model") { value }
    reverbFinish: metafield(namespace: "custom", key: "reverb_finish") { value }
    reverbMake: metafield(namespace: "custom", key: "reverb_make") { value }
    reverbYear: metafield(namespace: "custom", key: "reverb_year") { value }
    reverbCondition: metafield(namespace: "custom", key: "reverb_condition") { value }
    reverbPackageSize: metafield(namespace: "custom", key: "reverb_package_size") { value }
    reverbPackageWeight: metafield(namespace: "custom", key: "reverb_package_weight") { value }
`;

interface FieldNode {
    id: string;
    handle: string;
    title: string;
    category: { name: string; ancestors: { name: string }[] } | null;
    tags: string[];
    listOnReverb: { value: string } | null;
    reverbListingId: { value: string } | null;
    reverbModel: { value: string } | null;
    reverbFinish: { value: string } | null;
    reverbMake: { value: string } | null;
    reverbYear: { value: string } | null;
    reverbCondition: { value: string } | null;
    reverbPackageSize: { value: string } | null;
    reverbPackageWeight: { value: string } | null;
}

async function lookupFields(by: { productId: string } | { handle: string }) {
    if (!canReadMetafields()) {
        return null;
    }
    const data = 'handle' in by ? await storefrontQuery<{ product: FieldNode | null }>(`query ($handle: String!) { product(handle: $handle) { ${FIELD_QUERY} } }`, { handle: by.handle }, { fresh: true }) : await storefrontQuery<{ product: FieldNode | null }>(`query ($id: ID!) { product(id: $id) { ${FIELD_QUERY} } }`, { id: by.productId.startsWith('gid://') ? by.productId : `gid://shopify/Product/${by.productId}` }, { fresh: true });
    const node = data.product;
    if (!node) {
        return null;
    }
    const listingId = node.reverbListingId?.value?.trim() ?? null;
    return {
        productId: node.id.replace('gid://shopify/Product/', ''),
        handle: node.handle,
        title: node.title,
        category: classifyProduct({ category: node.category, tags: node.tags }),
        listOnReverb: node.listOnReverb ? node.listOnReverb.value === 'true' : null,
        reverbListingId: isReverbListingId(listingId) ? listingId : null,
        reverbModel: node.reverbModel?.value ?? null,
        reverbFinish: node.reverbFinish?.value ?? null,
        reverbMake: node.reverbMake?.value ?? null,
        reverbYear: node.reverbYear?.value ?? null,
        reverbCondition: node.reverbCondition?.value ?? null,
        reverbPackageSize: node.reverbPackageSize?.value ?? null,
        reverbPackageWeight: node.reverbPackageWeight?.value ?? null,
    };
}

export const liveDeps: SyncDeps = {
    lookupFields,
    findListingIdsBySku: findReverbListingIdsBySku,
    getListing: getReverbListing,
    createListing: createReverbListing,
    updateListing: updateReverbListing,
    endListing: endReverbListing,
    relistListing: relistReverbListing,
    canWriteReverb: hasReverbToken,
    alert: sendSalesAlert,
};

function errorText(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
}

/**
 * Find the Reverb listing for a Shopify product: by SKU first, then by the
 * Reverb listing ID field (for listings made by hand). A listing found by the
 * field gets the SKU written onto it, so it can be found later even when
 * Shopify hides the product.
 */
async function resolveListingId(productId: string, fields: ReverbFields | null, deps: SyncDeps): Promise<string | null> {
    const sku = skuForProduct(productId);
    if (deps.canWriteReverb()) {
        const bySku = await deps.findListingIdsBySku(sku);
        if (bySku.length > 0) {
            return bySku[0];
        }
    }
    if (fields?.reverbListingId) {
        if (deps.canWriteReverb()) {
            try {
                await deps.updateListing(fields.reverbListingId, { sku });
            } catch {
                // Not fatal: the field still links them while the product is visible.
            }
        }
        return fields.reverbListingId;
    }
    return null;
}

// ---------------------------------------------------------------- orders

export interface ShopifyOrder {
    id?: number | string;
    name?: string;
    email?: string | null;
    test?: boolean;
    line_items?: { product_id?: number | string | null; title?: string }[];
}

/**
 * Shopify's "Send test" notification builds its sample order from real store
 * products, so on 2026-11-13 a test ended the amp's live Reverb listing.
 * Never act on anything that looks like a test or sample order.
 */
export function isShopifyTestOrder(order: ShopifyOrder, testHeader: string | null = null): boolean {
    if (testHeader?.toLowerCase() === 'true') return true;
    if (order.test === true) return true;
    if (order.name === '#9999' || String(order.id ?? '') === '820982911946154508') return true;
    if (typeof order.email === 'string' && /@example\.(com|org|net)$/i.test(order.email)) return true;
    return false;
}

/** A Shopify order came in: end the matching Reverb listings, or flag a double sale. */
export async function handleShopifyOrder(order: ShopifyOrder, deps: SyncDeps = liveDeps, options: { testHeader?: string | null } = {}): Promise<string[]> {
    const results: string[] = [];
    const orderName = order.name ?? 'a Shopify order';
    if (isShopifyTestOrder(order, options.testHeader ?? null)) {
        const message = `🧪 Ignored a Shopify test notification (${orderName}). Nothing on Reverb was changed.`;
        await deps.alert(message);
        return [message];
    }
    const lineItems = (order.line_items ?? []).filter((item) => item.product_id !== null && item.product_id !== undefined);
    const seen = new Set<string>();

    for (const item of lineItems) {
        const productId = String(item.product_id);
        if (seen.has(productId)) continue;
        seen.add(productId);

        const fields = await deps.lookupFields({ productId });
        const title = fields?.title ?? item.title ?? 'An item';
        const id = await resolveListingId(productId, fields, deps);
        if (!id) continue;
        try {
            const listing = await deps.getListing(id);
            if (listing.state === 'sold') {
                const message = `⚠️ Double sale: "${title}" was bought on Shopify (${orderName}), but it already sold on Reverb. Cancel and refund ${orderName} before shipping. ${reverbListingUrl(id)}`;
                await deps.alert(message);
                results.push(message);
            } else if (listing.state === 'live') {
                if (!deps.canWriteReverb()) {
                    const message = `"${title}" sold on Shopify (${orderName}). End the Reverb listing by hand: ${reverbListingUrl(id)} (REVERB_API_TOKEN isn't set).`;
                    await deps.alert(message);
                    results.push(message);
                    continue;
                }
                await deps.endListing(id);
                const message = `✅ "${title}" sold on Shopify (${orderName}). I ended its Reverb listing. End the Facebook listing by hand.`;
                await deps.alert(message);
                results.push(message);
            }
        } catch (error) {
            const message = `⚠️ "${title}" sold on Shopify (${orderName}), but I couldn't end its Reverb listing. End it by hand: ${reverbListingUrl(id)} (${errorText(error)})`;
            await deps.alert(message);
            results.push(message);
        }
    }
    return results;
}

// ---------------------------------------------------------------- products

/** Shopify's sample product used by "Send test" on product webhooks. */
export function isShopifyTestProduct(product: { id?: number | string; title?: string }): boolean {
    return String(product.id ?? '') === '788032119674292922' || product.title === 'Example T-Shirt';
}

/** A Shopify product was created or updated: make Reverb match. */
export async function handleShopifyProduct(product: ShopifyProductPayload, deps: SyncDeps = liveDeps): Promise<string | null> {
    if (!deps.canWriteReverb() || isShopifyTestProduct(product)) {
        return null;
    }
    const productId = String(product.id);
    const fields = await deps.lookupFields({ productId });
    const title = product.title ?? fields?.title ?? 'A product';
    const status = (product.status ?? '').toLowerCase();
    const stock = shopifyStock(product);

    // Reasons the item should NOT be on Reverb. Each is an explicit signal from Shopify.
    const offReason = status === 'draft' || status === 'archived' ? `it's ${status} in Shopify` : stock !== null && stock <= 0 ? "it's sold out in Shopify" : fields?.listOnReverb === false ? '"List on Reverb" is off' : null;

    const id = await resolveListingId(productId, fields, deps);

    try {
        if (!id) {
            if (offReason || fields?.listOnReverb !== true || status !== 'active') {
                return null;
            }
            return await createFor(product, fields, deps);
        }

        const listing = await deps.getListing(id);
        if (listing.state === 'sold') {
            return null; // Reverb sold it; the page check and order alerts handle the rest.
        }

        if (offReason) {
            if (listing.state !== 'live') return null;
            await deps.endListing(id);
            return await say(deps, `🛑 Ended the Reverb listing for "${title}" because ${offReason}. ${reverbListingUrl(id)}`);
        }

        if (!fields) {
            // Active but Shopify won't show it to the site (not published to the Headless channel). Don't guess.
            return null;
        }

        const changes: string[] = [];
        const update: Record<string, unknown> = {};
        const price = shopifyPrice(product);
        if (price !== null) {
            const target = reverbPriceFor(price);
            if (listing.price !== target) {
                update.price = { amount: target.toFixed(2), currency: 'USD' };
                changes.push(`price $${listing.price ?? '?'} → $${target}`);
            }
        }
        if (product.title && listing.title !== undefined && product.title !== listing.title) {
            update.title = product.title;
            changes.push('title');
        }
        if (product.body_html && listing.description !== undefined && descriptionText(product.body_html) !== descriptionText(listing.description)) {
            update.description = reverbDescription(product.body_html);
            changes.push('description');
        }
        // Edits go in first, so a refused relist can't hold them back.
        if (Object.keys(update).length > 0) {
            await deps.updateListing(id, update);
        }

        if (listing.state === 'ended') {
            try {
                await deps.relistListing(id);
                changes.push('relisted it');
            } catch (error) {
                const updated = changes.length > 0 ? `I updated its ${changes.join(', ')}, but ` : '';
                return await say(deps, `⚠️ "${title}" is Active in Shopify, but ${updated}Reverb wouldn't relist it: ${errorText(error)}. Relist it in Reverb's editor. ${reverbListingUrl(id)}`);
            }
        }

        if (changes.length === 0) {
            return null;
        }
        // A draft is never published from here. It's a draft because Reverb refused its shipping (or it was made by hand),
        // so publishing would fail the same way. I publish it in Reverb's editor once its shipping is set.
        const draftNote = listing.state === 'draft' ? " It's still a draft on Reverb: set its shipping in Reverb's editor and publish it there." : '';
        return await say(deps, `🔄 Updated the Reverb listing for "${title}": ${changes.join(', ')}.${draftNote} ${reverbListingUrl(id)}`);
    } catch (error) {
        return await say(deps, `⚠️ Couldn't sync "${title}" to Reverb: ${errorText(error)}${id ? ` ${reverbListingUrl(id)}` : ''}`);
    }
}

async function createFor(product: ShopifyProductPayload, fields: ReverbFields, deps: SyncDeps): Promise<string> {
    const title = product.title ?? fields.title;
    const reason = cannotListReason(product, fields);
    if (reason) {
        return say(deps, `⚠️ "${title}" has "List on Reverb" on, but I can't list it because ${reason}.`);
    }
    // Another webhook for the same product may have just created it.
    const sku = skuForProduct(product.id);
    if ((await deps.findListingIdsBySku(sku)).length > 0) {
        return say(deps, `"${title}" is already on Reverb.`);
    }
    const bodies = buildReverbListing(product, fields);
    let id: string;
    let live = true;
    let liveError = '';
    try {
        id = await deps.createListing(bodies.live);
    } catch (error) {
        live = false;
        liveError = errorText(error);
        id = await deps.createListing(bodies.draft);
    }
    // If two webhooks raced, keep the first listing and end the rest.
    const all = await deps.findListingIdsBySku(sku);
    for (const extra of all.filter((other) => other !== all[0])) {
        await deps.endListing(extra).catch(() => {});
    }
    if (all.length > 0) id = all[0];

    if (live) {
        return say(deps, `🆕 Listed "${title}" on Reverb at $${reverbPriceFor(shopifyPrice(product)!)} with calculated shipping. ${reverbListingUrl(id)}`);
    }
    return say(deps, `📝 Created "${title}" on Reverb as a draft: Reverb didn't accept calculated shipping (${liveError.slice(0, 200)}). In Reverb's editor, set calculated shipping with the box (${describePackage(packageFor(fields))}) and publish it. Later Shopify edits keep the draft's price, title, and description in sync but never publish it. ${reverbListingUrl(id)}`);
}

/** A Shopify product was deleted: end its Reverb listing. */
export async function handleShopifyProductDelete(payload: { id?: number | string }, deps: SyncDeps = liveDeps): Promise<string | null> {
    if (payload.id === undefined || !deps.canWriteReverb() || isShopifyTestProduct(payload)) {
        return null;
    }
    const ids = await deps.findListingIdsBySku(skuForProduct(payload.id));
    for (const id of ids) {
        try {
            const listing = await deps.getListing(id);
            if (listing.state === 'live') {
                await deps.endListing(id);
                return await say(deps, `🛑 Ended Reverb listing ${id} because its Shopify product was deleted. ${reverbListingUrl(id)}`);
            }
        } catch (error) {
            return await say(deps, `⚠️ A Shopify product was deleted, but I couldn't end its Reverb listing: ${errorText(error)} ${reverbListingUrl(id)}`);
        }
    }
    return null;
}

async function say(deps: SyncDeps, message: string): Promise<string> {
    await deps.alert(message);
    return message;
}

// ---------------------------------------------------------------- product page

export type PageAvailability = { status: 'available' } | { status: 'sold-elsewhere'; title: string; reverbListingId: string };

/** Someone opened a product page: make sure the item hasn't already sold on Reverb. */
export async function checkProductAvailability(handle: string, deps: SyncDeps = liveDeps): Promise<PageAvailability> {
    const fields = await deps.lookupFields({ handle });
    if (!fields) {
        return { status: 'available' };
    }
    const id = fields.reverbListingId ?? (deps.canWriteReverb() ? ((await deps.findListingIdsBySku(skuForProduct(fields.productId)))[0] ?? null) : null);
    if (!id) {
        return { status: 'available' };
    }
    const listing = await deps.getListing(id);
    // Only a Reverb sale blocks the page. An ended listing (taken down by hand, or by this sync) doesn't mean it sold.
    return listing.state === 'sold' ? { status: 'sold-elsewhere', title: fields.title, reverbListingId: id } : { status: 'available' };
}
