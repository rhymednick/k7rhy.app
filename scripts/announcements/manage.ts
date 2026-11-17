/** Run with `npx tsx scripts/announcements/manage.ts ...` in a configured Netlify environment. */
import { announcementChannel, processItem } from '../../lib/announcements/process';
import { backfillListings, readListing } from '../../lib/announcements/shopify';
import { acquireItem } from '../../lib/announcements/store';
import { renderListing } from '../../lib/announcements/model';

const args = process.argv.slice(2);
const command = args[0];
const value = (name: string) => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
};
const apply = args.includes('--apply');
const productId = value('--product');
if (!['backfill', 'replay', 'inspect', 'resolve', 'sold', 'restore'].includes(command)) throw new Error('Use backfill [--apply], replay/inspect --product ID, or resolve --product ID --message ID|not-sent [--apply]');
if (command === 'backfill') {
    const listings = await backfillListings();
    for (const listing of listings) {
        console.log(renderListing(listing, 'Available'));
        if (apply) {
            const channel = announcementChannel();
            if (!channel) throw new Error('Live announcements are disabled or this is not the production context');
            await processItem(listing.id, channel);
        }
    }
    console.log(`${listings.length} eligible listings${apply ? ' processed' : ' (dry run; no posts sent)'}`);
} else {
    if (!productId || !/^\d+$/.test(productId)) throw new Error('Supply --product with the numeric Shopify product ID');
    if (command === 'replay' || command === 'sold') {
        if (!apply) console.log(await readListing(productId));
        else {
            const channel = announcementChannel();
            if (!channel) throw new Error('Live announcements are disabled or this is not the production context');
            await processItem(productId, channel, { sold: command === 'sold' });
        }
    } else {
        // Inspection and resolution require the configured database, never a secret printed to the terminal.
        const session = await acquireItem(productId);
        try {
            if (command === 'restore') {
                if (session.state.pending || session.state.queue?.length) throw new Error('Resolve pending work before restoring');
                console.log(`Clear confirmed sold status for ${productId}${apply ? '' : ' (dry run)'}`);
                if (apply) await session.save({ ...session.state, sold: false });
            } else if (command === 'inspect') console.log(JSON.stringify(session.state, null, 2));
            else {
                const pending = session.state.pending;
                const message = value('--message');
                if (!pending || pending.kind !== 'create') throw new Error('No uncertain create to resolve');
                if (!message || (message !== 'not-sent' && !/^\d+$/.test(message))) throw new Error('Inspect the channel, then supply --message ID or not-sent');
                console.log(`Resolve ${pending.key} as ${message}${apply ? '' : ' (dry run)'}`);
                if (apply) {
                    const state = session.state;
                    if (message !== 'not-sent') {
                        if (pending.purpose === 'listing') {
                            state.messageId = message;
                            state.content = pending.content;
                        }
                        state.queue = state.queue?.slice(1);
                        if (!state.queue?.length) {
                            state.price = state.nextPrice;
                            state.currency = state.nextCurrency;
                        }
                    }
                    state.pending = undefined;
                    state.failure = undefined;
                    await session.save(state);
                }
            }
        } finally {
            await session.release();
        }
    }
}
