/**
 * Small Reverb API client for the Shopify ↔ Reverb sync.
 *
 * Reading a listing is public. Creating, updating, ending, and relisting need a
 * Reverb personal access token in REVERB_API_TOKEN (server-only, never logged).
 * See docs/engineering/listing-runbook.md.
 */

const REVERB_API = 'https://api.reverb.com/api';

export type ReverbListingState = 'live' | 'sold' | 'ended' | 'draft' | 'unknown';

export interface ReverbListing {
    id: string;
    state: ReverbListingState;
    title?: string;
    description?: string;
    price: number | null;
    currency: string | null;
    inventory: number | null;
}

export class ReverbError extends Error {
    constructor(
        message: string,
        readonly status?: number
    ) {
        super(message);
    }
}

function headers(withAuth: boolean): Record<string, string> {
    const base: Record<string, string> = {
        Accept: 'application/hal+json',
        'Accept-Version': '3.0',
        'Content-Type': 'application/hal+json',
    };
    const token = process.env.REVERB_API_TOKEN;
    if (withAuth && !token) {
        throw new ReverbError('REVERB_API_TOKEN is not set');
    }
    // Reads are public, but Reverb answered unsigned reads from Netlify with 403 (2026-11-13), so sign whenever a token exists.
    if (token) {
        base.Authorization = `Bearer ${token}`;
    }
    return base;
}

export function hasReverbToken(): boolean {
    return Boolean(process.env.REVERB_API_TOKEN);
}

export function isReverbListingId(value: unknown): value is string {
    return typeof value === 'string' && /^[0-9]+$/.test(value);
}

function toState(slug: unknown): ReverbListingState {
    return slug === 'live' || slug === 'sold' || slug === 'ended' || slug === 'draft' ? slug : 'unknown';
}

/** Current state of a listing, straight from Reverb (never cached). */
export async function getReverbListing(id: string): Promise<ReverbListing> {
    if (!isReverbListingId(id)) {
        throw new ReverbError(`Not a Reverb listing ID: ${id}`);
    }
    const response = await fetch(`${REVERB_API}/listings/${id}`, { headers: headers(false), cache: 'no-store' });
    if (!response.ok) {
        throw new ReverbError(`Reverb returned ${response.status} for listing ${id}`, response.status);
    }
    const body = (await response.json()) as { id?: number; title?: string; description?: string; state?: { slug?: string }; price?: { amount?: string; currency?: string }; inventory?: number };
    return {
        id,
        state: toState(body.state?.slug),
        title: body.title,
        description: body.description,
        price: body.price?.amount ? Number(body.price.amount) : null,
        currency: body.price?.currency ?? null,
        inventory: typeof body.inventory === 'number' ? body.inventory : null,
    };
}

/**
 * End a live listing because the item sold somewhere else. Uses Reverb's
 * no-fee "not sold" reason, never the "Reverb found me a buyer" reason,
 * which charges a selling fee.
 */
export async function endReverbListing(id: string): Promise<void> {
    const response = await fetch(`${REVERB_API}/my/listings/${id}/state/end`, {
        method: 'PUT',
        headers: headers(true),
        body: JSON.stringify({ reason: 'not_sold' }),
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new ReverbError(`Reverb refused to end listing ${id} (${response.status}): ${(await response.text()).slice(0, 300)}`, response.status);
    }
}

async function reverbWrite(method: 'POST' | 'PUT', path: string, body: unknown): Promise<Record<string, unknown>> {
    const response = await fetch(`${REVERB_API}${path}`, { method, headers: headers(true), body: JSON.stringify(body), cache: 'no-store' });
    const text = await response.text();
    if (!response.ok) {
        throw new ReverbError(`Reverb ${method} ${path} failed (${response.status}): ${text.slice(0, 400)}`, response.status);
    }
    try {
        return text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
        return {};
    }
}

/** IDs of this shop's listings with the given SKU, in any state (needs REVERB_API_TOKEN). */
export async function findReverbListingIdsBySku(sku: string): Promise<string[]> {
    const response = await fetch(`${REVERB_API}/my/listings?sku=${encodeURIComponent(sku)}&state=all`, { headers: headers(true), cache: 'no-store' });
    if (!response.ok) {
        throw new ReverbError(`Reverb returned ${response.status} looking up SKU ${sku}`, response.status);
    }
    const body = (await response.json()) as { listings?: { id?: number | string; sku?: string }[] };
    return (body.listings ?? []).filter((listing) => listing.sku === sku && listing.id !== undefined).map((listing) => String(listing.id));
}

/** Create a listing. Returns its ID. */
export async function createReverbListing(body: Record<string, unknown>): Promise<string> {
    const result = await reverbWrite('POST', '/listings', body);
    const listing = (result.listing ?? result) as { id?: number | string };
    if (listing.id === undefined) {
        throw new ReverbError(`Reverb created a listing but returned no ID: ${JSON.stringify(result).slice(0, 300)}`);
    }
    return String(listing.id);
}

export async function updateReverbListing(id: string, fields: Record<string, unknown>): Promise<void> {
    await reverbWrite('PUT', `/listings/${id}`, fields);
}

/** Put an ended (not sold) listing back up. */
export async function relistReverbListing(id: string): Promise<void> {
    await reverbWrite('PUT', `/listings/${id}`, { publish: true });
}

export function reverbListingUrl(id: string): string {
    return `https://reverb.com/item/${id}`;
}
