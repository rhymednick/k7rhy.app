import { classifyProduct } from '@/lib/shop/catalog';
import { canReadMetafields, storefrontQuery } from '@/lib/shop/storefront';
import { plain, type Listing } from './model';

export const ANNOUNCEMENT_FIELDS = `
    id handle title onlineStoreUrl availableForSale tags
    category { name ancestors { name } }
    variants(first: 2) { nodes { quantityAvailable price { amount currencyCode } } }
    summary: metafield(namespace: "custom", key: "discord_description") { value }
    record: metafield(namespace: "custom", key: "discord_record_url") { value }
    related: metafield(namespace: "custom", key: "discord_related_urls") { value }
`;
interface Node {
    id: string;
    handle: string;
    title: string;
    onlineStoreUrl: string | null;
    availableForSale: boolean;
    tags: string[];
    category: { name: string; ancestors: { name: string }[] } | null;
    variants: { nodes: { quantityAvailable: number | null; price: { amount: string; currencyCode: string } }[] };
    summary: { value: string } | null;
    record: { value: string } | null;
    related: { value: string } | null;
}
function safeUrl(value: string): string {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || value.length > 500) throw new Error('Announcement links must be HTTPS URLs under 500 characters');
    return url.href;
}
export function normalizeListing(node: Node): Listing | null {
    const category = classifyProduct(node);
    if (category !== 'guitars' && category !== 'amplifiers') return null;
    if (node.variants.nodes.length !== 1) return null;
    // Missing approval copy is an eligibility failure, never an invitation to generate it.
    const description = node.summary?.value.trim();
    if (!description || !plain(description)) return null;
    if (plain(description).length > 650) throw new Error('Approved Discord description exceeds 650 characters; shorten and approve it before posting');
    const variant = node.variants.nodes[0];
    const price = Number(variant.price.amount);
    if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid announcement price');
    const related: unknown = node.related ? JSON.parse(node.related.value) : [];
    if (!Array.isArray(related) || related.length > 3 || related.some((url) => typeof url !== 'string')) throw new Error('Related URLs must be a list of at most three URLs');
    const links = [
        { label: 'Purchase', url: safeUrl(node.onlineStoreUrl || `https://shop.k7rhy.app/products/${node.handle}`) },
        { label: 'Details', url: safeUrl(`https://k7rhy.app/shop/${category}/${node.handle}`) },
    ];
    if (node.record?.value) {
        const record = safeUrl(node.record.value);
        if (!/^https:\/\/k7rhy\.app\/sn\/[A-Z0-9]+\/?$/.test(record)) throw new Error('Serial record must be an exact k7rhy.app/sn/ record URL');
        links.push({ label: 'Instrument record', url: record });
    }
    links.push(...related.map((url) => ({ label: 'Related', url: safeUrl(url) })));
    const listing = { id: node.id.split('/').pop()!, title: node.title, description, price, currency: variant.price.currencyCode, available: node.availableForSale && variant.quantityAvailable !== null && variant.quantityAvailable > 0 && !!node.onlineStoreUrl, ready: node.tags.includes('discord-ready'), links };
    // Never truncate links to fit Discord's limit: request a shorter description instead.
    if (links.reduce((length, link) => length + link.url.length + link.label.length + 5, 0) > 950) throw new Error('Announcement links are too long; use fewer related URLs');
    return listing;
}
export async function readListing(id: string): Promise<Listing | null> {
    if (!canReadMetafields()) throw new Error('Storefront token required for announcement fields');
    const data = await storefrontQuery<{ product: Node | null }>(`query AnnouncementProduct($id: ID!) { product(id: $id) { ${ANNOUNCEMENT_FIELDS} } }`, { id: `gid://shopify/Product/${id}` }, { fresh: true });
    return data.product ? normalizeListing(data.product) : null;
}
export async function backfillListings(): Promise<Listing[]> {
    if (!canReadMetafields()) throw new Error('Storefront token required for announcement fields');
    const result: Listing[] = [];
    let cursor: string | null = null;
    do {
        const data: { products: { nodes: Node[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } = await storefrontQuery(`query AnnouncementBackfill($cursor: String) { products(first: 50, after: $cursor) { nodes { ${ANNOUNCEMENT_FIELDS} } pageInfo { hasNextPage endCursor } } }`, { cursor }, { fresh: true });
        for (const node of data.products.nodes) {
            const listing = normalizeListing(node);
            if (listing?.ready && listing.available) result.push(listing);
        }
        cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } while (cursor);
    return result;
}
