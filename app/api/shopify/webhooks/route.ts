import { NextResponse } from 'next/server';
import { handleShopifyOrder, handleShopifyProductUpdate } from '@/lib/sync/reverb-sync';
import { verifyShopifyWebhook } from '@/lib/sync/shopify-webhook';

export const dynamic = 'force-dynamic';

/**
 * Shopify webhooks (Settings → Notifications → Webhooks, JSON format):
 * - Order creation → end the Reverb listing, or flag a double sale.
 * - Product update → keep the Reverb price on the markup rule.
 * See docs/engineering/listing-runbook.md.
 */
export async function POST(request: Request) {
    const rawBody = await request.text();
    if (!verifyShopifyWebhook(rawBody, request.headers.get('x-shopify-hmac-sha256'), process.env.SHOPIFY_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }

    const topic = request.headers.get('x-shopify-topic');
    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
    }

    try {
        if (topic === 'orders/create') {
            await handleShopifyOrder(payload as Parameters<typeof handleShopifyOrder>[0]);
        } else if (topic === 'products/update') {
            await handleShopifyProductUpdate(payload as Parameters<typeof handleShopifyProductUpdate>[0]);
        }
    } catch (error) {
        // Answer 200 anyway: the handlers already alert on failures, and a Shopify retry won't fix them.
        console.error(`[shopify-webhook] ${topic} failed:`, error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ok: true });
}
