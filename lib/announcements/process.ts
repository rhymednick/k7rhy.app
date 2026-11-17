import { DiscordRejection, deliver } from './discord';
import { plan, type ItemState, type Listing, type Action } from './model';
import { readListing } from './shopify';
import { acquireItem, type ItemSession } from './store';
import { announcementChannelId, productAnnouncementsEnabled } from '@/config/community';

export interface AnnouncementDeps {
    acquire(id: string): Promise<ItemSession>;
    read(id: string): Promise<Listing | null>;
    send(channel: string, action: Action): Promise<string>;
}
export const announcementDeps: AnnouncementDeps = { acquire: acquireItem, read: readListing, send: deliver };
export function announcementChannel(): string | null {
    // Preview builds must never post to the production server.
    if (process.env.CONTEXT !== 'production') return null;
    const enabled = process.env.DISCORD_ANNOUNCEMENTS_ENABLED;
    if (enabled !== undefined ? enabled !== 'true' : !productAnnouncementsEnabled) return null;
    const channel = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID ?? announcementChannelId;
    if (!channel || !/^\d+$/.test(channel)) throw new Error('Configure DISCORD_ANNOUNCEMENTS_CHANNEL_ID');
    return channel;
}

/** A write-ahead action survives process crashes; the webhook gets 503 on failure. */
export async function processItem(id: string, channel: string, options: { sold?: boolean; unavailable?: boolean } = {}, deps = announcementDeps): Promise<void> {
    if (!/^\d+$/.test(id)) throw new Error('Invalid Shopify product ID');
    const session = await deps.acquire(id);
    let state: ItemState = session.state;
    async function flush() {
        if (state.pending?.kind === 'create') throw new Error(`Uncertain Discord create for product ${id}; inspect channel and resolve with the announcement command`);
        for (const job of state.queue ?? []) {
            state.pending = job;
            await session.save(state);
            let messageId: string;
            try {
                messageId = await deps.send(channel, job);
            } catch (error) {
                if (error instanceof DiscordRejection) state.pending = undefined;
                state.failure = error instanceof Error ? error.message : 'Delivery failed';
                await session.save(state);
                throw error;
            }
            if (job.purpose === 'listing') {
                state.messageId = messageId;
                state.content = job.content;
            }
            state.channelId = channel;
            state.queue = state.queue?.slice(1);
            state.pending = undefined;
            state.failure = undefined;
            if (!state.queue?.length) {
                state.price = state.nextPrice;
                state.currency = state.nextCurrency;
            }
            await session.save(state);
        }
    }
    try {
        if (state.channelId && state.channelId !== channel) throw new Error('Channel migration required');
        if ((options.sold || options.unavailable) && state.pending?.kind !== 'create') {
            // Do not send a previously rejected Available post after a withdrawal or sale.
            state.queue = [];
            state.pending = undefined;
        }
        if (options.sold) {
            state.sold = true;
            // A confirmed sale suppresses queued price-drop notices that have not been attempted.
            state.queue = state.queue?.filter((job) => job.purpose !== 'drop' || job.key === state.pending?.key);
            await session.save(state);
        }
        await flush();
        const listing = options.unavailable || options.sold ? null : await deps.read(id);
        const result = plan(id, state, listing, options.sold ?? false, channel);
        state = { ...result.state, channelId: state.channelId ?? channel, queue: result.actions, nextPrice: listing?.price ?? state.price, nextCurrency: listing?.currency ?? state.currency };
        await session.save(state);
        await flush();
    } finally {
        await session.release();
    }
}
