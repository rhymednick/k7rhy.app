import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { reverbListingUrl } from '@/lib/reverb/client';
import { sendSalesAlert } from '@/lib/sync/alert';
import { checkProductAvailability } from '@/lib/sync/reverb-sync';

export const dynamic = 'force-dynamic';

/** Remind the owner at most once an hour per listing, however many people open the page. */
function remindOnce(title: string, reverbListingId: string) {
    return unstable_cache(
        async () => {
            await sendSalesAlert(`🔔 "${title}" sold on Reverb but is still for sale on Shopify. Set its Shopify quantity to 0 so nobody buys it there. ${reverbListingUrl(reverbListingId)}`);
            return Date.now();
        },
        ['reverb-sold-reminder', reverbListingId],
        { revalidate: 3600 }
    )();
}

/** Called by a product page when it opens: has this item already sold on Reverb? */
export async function GET(request: Request) {
    const handle = new URL(request.url).searchParams.get('handle') ?? '';
    if (!/^[a-z0-9-]{1,255}$/.test(handle)) {
        return NextResponse.json({ error: 'invalid handle' }, { status: 400 });
    }
    try {
        const availability = await checkProductAvailability(handle);
        if (availability.status === 'sold-elsewhere') {
            await remindOnce(availability.title, availability.reverbListingId);
        }
        return NextResponse.json({ status: availability.status }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        // Fail open: if Reverb or Shopify can't be reached, don't block the buy button.
        console.error('[shop-availability] check failed:', error instanceof Error ? error.message : error);
        return NextResponse.json({ status: 'unknown' }, { headers: { 'Cache-Control': 'no-store' } });
    }
}
