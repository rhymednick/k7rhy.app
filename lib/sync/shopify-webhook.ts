import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify a Shopify webhook. Shopify signs the raw request body with the
 * secret shown under Settings → Notifications → Webhooks and sends the
 * base64 HMAC-SHA256 in the X-Shopify-Hmac-Sha256 header.
 */
export function verifyShopifyWebhook(rawBody: string, signature: string | null, secret: string | undefined): boolean {
    if (!signature || !secret) {
        return false;
    }
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
    let received: Buffer;
    try {
        received = Buffer.from(signature, 'base64');
    } catch {
        return false;
    }
    return received.length === expected.length && timingSafeEqual(received, expected);
}
