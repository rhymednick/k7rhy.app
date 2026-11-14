import { NextResponse } from 'next/server';
import { handleShopifyOrder, type ShopifyOrder } from '@/lib/sync/reverb-sync';
import { verifyShopifyWebhook } from '@/lib/sync/shopify-webhook';

export const dynamic = 'force-dynamic';

/**
 * Shopify webhooks (Settings → Notifications → Webhooks, JSON format):
 * - Order creation → end the Reverb listing, or flag a double sale.
 * Prices are never synced from Shopify to Reverb: Reverb leads on price.
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
            const order = payload as ShopifyOrder;
            // A safe summary (no customer details) so test and real deliveries can be told apart in the Netlify log.
            console.log('[shopify-webhook] orders/create', JSON.stringify({ name: order.name, test: order.test, testHeader: request.headers.get('x-shopify-test'), productIds: (order.line_items ?? []).map((item) => item.product_id) }));
            await handleShopifyOrder(order, undefined, { testHeader: request.headers.get('x-shopify-test') });
        }
    } catch (error) {
        // Answer 200 anyway: the handlers already alert on failures, and a Shopify retry won't fix them.
        console.error(`[shopify-webhook] ${topic} failed:`, error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ok: true });
}
