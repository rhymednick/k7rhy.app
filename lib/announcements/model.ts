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
    return escapeText(text).trim();
}
function escapeText(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/([\\`*_~|>\[\]])/g, '\\$1');
}
export function linkedText(label: string, destination: string): string {
    const url = new URL(destination);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Announcement links must be HTTPS URLs');
    return `[${plain(label)}](${url.href.replace(/[()<>]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)})`;
}

function linkPresentation(link: Listing['links'][number]): { label: string; phrase?: RegExp } {
    const url = new URL(link.url);
    if (link.label === 'Instrument record') return { label: 'instrument record', phrase: /\binstrument record\b/gi };
    if (url.hostname === 'k7rhy.app') {
        if (/^\/sn\/[A-Z0-9]+\/wiring\/?$/.test(url.pathname)) return { label: 'wiring reference', phrase: /\b(?:series switch(?: for the paired-pickup positions)?|neck-add switch|partial coil splits|wiring reference)\b/gi };
        if (/^\/guitars\/relay\/voicings\/?$/.test(url.pathname)) return { label: 'Relay voicings', phrase: /\bvoicing development\b|\bRelay voicings\b/gi };
        if (/^\/guitars\/relay\/?$/.test(url.pathname)) return { label: 'Relay platform', phrase: /\bRelay\b/gi };
    }
    return { label: link.label === 'Related' ? 'related page' : link.label };
}

/** Link existing approved words; unused links become a short sentence in the same paragraph. */
function linkedDescription(listing: Listing): string {
    const source = listing.description.replace(/<[^>]*>/g, '').trim();
    const ranges: { start: number; end: number; url: string }[] = [];
    const remaining: string[] = [];
    for (const link of listing.links.filter(({ label }) => label !== 'Purchase' && label !== 'Details')) {
        const presentation = linkPresentation(link);
        const match = presentation.phrase && [...source.matchAll(presentation.phrase)].find((candidate) => !ranges.some((range) => candidate.index! < range.end && candidate.index! + candidate[0].length > range.start));
        if (match) ranges.push({ start: match.index!, end: match.index! + match[0].length, url: link.url });
        else remaining.push(linkedText(presentation.label, link.url));
    }
    let cursor = 0;
    let description = '';
    for (const range of ranges.sort((a, b) => a.start - b.start)) {
        description += escapeText(source.slice(cursor, range.start)) + linkedText(source.slice(range.start, range.end), range.url);
        cursor = range.end;
    }
    description += escapeText(source.slice(cursor));
    if (remaining.length) {
        const links = remaining.length === 1 ? remaining[0] : `${remaining.slice(0, -1).join(', ')} and ${remaining.at(-1)}`;
        description += ` See the ${links}.`;
    }
    return description;
}
export function renderListing(listing: Listing, status: Availability): string {
    const description = plain(listing.description);
    if (!description || description.length > 650) throw new Error('An approved Discord description of 1–650 characters is required');
    const purchaseLinks = listing.links
        .filter(({ label }) => label === 'Purchase' || label === 'Details')
        .map(({ label, url }) => linkedText(label === 'Details' ? 'Product details' : label, url))
        .join(' · ');
    return [`**${status}: ${plain(listing.title).slice(0, 250)}**`, `${formatPrice(listing.price, listing.currency)}`, linkedDescription(listing), purchaseLinks].filter(Boolean).join('\n\n');
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
        actions.push(action(`${id}:${seq}:drop`, `create`, `**Price drop: ${plain(current.title).slice(0, 250)}**\n\n${formatPrice(state.price, current.currency)} → ${formatPrice(current.price, current.currency)}\n\n${linkedText('View listing', `https://discord.com/channels/1432214244459417693/${channel}/${state.messageId}`)}`, 'drop'));
    }
    next.sequence = seq;
    return { state: next, actions };
}
