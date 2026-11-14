/**
 * Small Reverb API client for the Shopify ↔ Reverb sync.
 *
 * Reading a listing is public. Ending a listing or changing its price needs a
 * Reverb personal access token in REVERB_API_TOKEN (server-only, never logged).
 * See docs/engineering/listing-runbook.md.
 */

const REVERB_API = 'https://api.reverb.com/api';

export type ReverbListingState = 'live' | 'sold' | 'ended' | 'draft' | 'unknown';

export interface ReverbListing {
    id: string;
    state: ReverbListingState;
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
    if (withAuth) {
        const token = process.env.REVERB_API_TOKEN;
        if (!token) {
            throw new ReverbError('REVERB_API_TOKEN is not set');
        }
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
    const body = (await response.json()) as { id?: number; state?: { slug?: string }; price?: { amount?: string; currency?: string }; inventory?: number };
    return {
        id,
        state: toState(body.state?.slug),
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

export async function updateReverbPrice(id: string, amount: number, currency = 'USD'): Promise<void> {
    const response = await fetch(`${REVERB_API}/listings/${id}`, {
        method: 'PUT',
        headers: headers(true),
        body: JSON.stringify({ price: { amount: amount.toFixed(2), currency } }),
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new ReverbError(`Reverb refused the price change for listing ${id} (${response.status}): ${(await response.text()).slice(0, 300)}`, response.status);
    }
}

export function reverbListingUrl(id: string): string {
    return `https://reverb.com/item/${id}`;
}
