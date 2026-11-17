import { createHash } from 'node:crypto';
import { formatPrice } from '@/lib/shop/catalog';

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    available: boolean;
    ready: boolean;
    links: { label: string; url: string }[];
}
export type Availability = 'Available' | 'Unavailable' | 'Sold';
export interface Action {
    key: string;
    kind: 'create' | 'edit';
    content: string;
    nonce: string;
    target?: string;
    purpose: 'listing' | 'drop';
}
export interface ItemState {
    listing?: Listing;
    messageId?: string;
    channelId?: string;
    price?: number;
    currency?: string;
    sold?: boolean;
    content?: string;
    sequence?: number;
    pending?: Action;
    failure?: string;
    queue?: Action[];
    nextPrice?: number;
    nextCurrency?: string;
}

/** Escape owner-authored text so it cannot create mentions or unexpected Markdown. */
export function plain(text: string): string {
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/([\\`*_~|>\[\]])/g, '\\$1')
        .trim();
}
export function renderListing(listing: Listing, status: Availability): string {
    const description = plain(listing.description);
    if (!description || description.length > 650) throw new Error('An approved Discord description of 1–650 characters is required');
    return [`**${status}: ${plain(listing.title).slice(0, 250)}**`, `${formatPrice(listing.price, listing.currency)}`, description, ...listing.links.map(({ label, url }) => `${label}: ${url}`)].filter(Boolean).join('\n\n');
}
export function action(key: string, kind: Action['kind'], content: string, purpose: Action['purpose'], target?: string): Action {
    return { key, kind, content, purpose, target, nonce: createHash('sha256').update(key).digest('hex').slice(0, 24) };
}

export function plan(id: string, state: ItemState, listing: Listing | null, sold: boolean, channel: string): { state: ItemState; actions: Action[] } {
    const next = { ...state, sold: state.sold || sold };
    if (listing) next.listing = listing;
    const current = listing ?? state.listing;
    if (!current || (!state.messageId && (!listing?.ready || !listing.available || next.sold))) return { state: next, actions: [] };
    if (state.channelId && state.channelId !== channel) throw new Error('Announcement channel changed; migrate saved posts before continuing');
    const status: Availability = next.sold ? 'Sold' : listing?.ready && listing.available ? 'Available' : 'Unavailable';
    const content = renderListing(current, status);
    const seq = (state.sequence ?? 0) + 1;
    const actions: Action[] = [];
    if (content !== state.content) actions.push(action(`${id}:${seq}:listing`, state.messageId ? 'edit' : 'create', content, 'listing', state.messageId));
    if (state.messageId && status === 'Available' && state.currency === current.currency && state.price !== undefined && current.price < state.price) {
        actions.push(action(`${id}:${seq}:drop`, `create`, `**Price drop: ${plain(current.title).slice(0, 250)}**\n\n${formatPrice(state.price, current.currency)} → ${formatPrice(current.price, current.currency)}\n\nhttps://discord.com/channels/1432214244459417693/${channel}/${state.messageId}`, 'drop'));
    }
    next.sequence = seq;
    return { state: next, actions };
}
