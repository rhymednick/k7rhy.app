// @vitest-environment node
import { createHmac } from 'node:crypto';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/announcements/webhook', () => ({ handleAnnouncementWebhook: vi.fn() }));
vi.mock('@/lib/sync/reverb-sync', () => ({ handleShopifyOrder: vi.fn(), handleShopifyProduct: vi.fn(), handleShopifyProductDelete: vi.fn() }));
import { POST } from './route';
import { handleAnnouncementWebhook } from '@/lib/announcements/webhook';
import { handleShopifyProduct } from '@/lib/sync/reverb-sync';
beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SHOPIFY_WEBHOOK_SECRET', 'test-secret');
});
afterEach(() => vi.unstubAllEnvs());
function request(signature = true) {
    const body = JSON.stringify({ id: 123 });
    return new Request('https://k7rhy.app/api/shopify/webhooks', { method: 'POST', body, headers: { 'x-shopify-topic': 'products/update', 'x-shopify-hmac-sha256': signature ? createHmac('sha256', 'test-secret').update(body).digest('base64') : 'bad' } });
}
it('rejects unauthenticated deliveries before either integration acts', async () => {
    expect((await POST(request(false))).status).toBe(401);
    expect(handleAnnouncementWebhook).not.toHaveBeenCalled();
    expect(handleShopifyProduct).not.toHaveBeenCalled();
});
it('returns a retryable response for announcement failures and still runs Reverb', async () => {
    vi.mocked(handleAnnouncementWebhook).mockRejectedValueOnce(new Error('Discord unreachable'));
    expect((await POST(request())).status).toBe(503);
    expect(handleShopifyProduct).toHaveBeenCalledOnce();
});
it('keeps announcement delivery independent of a Reverb failure', async () => {
    vi.mocked(handleShopifyProduct).mockRejectedValueOnce(new Error('Reverb unreachable'));
    expect((await POST(request())).status).toBe(200);
    expect(handleAnnouncementWebhook).toHaveBeenCalledOnce();
});
