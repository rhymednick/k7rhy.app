import { afterEach, describe, expect, it, vi } from 'vitest';
import { endReverbListing, getReverbListing } from './client';

function stubFetch(body: unknown = { state: { slug: 'live' }, price: { amount: '775.00', currency: 'USD' }, inventory: 1 }) {
    const fetchMock = vi.fn(async (..._args: unknown[]) => new Response(JSON.stringify(body), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function sentHeaders(fetchMock: ReturnType<typeof stubFetch>): Record<string, string> {
    return (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
}

describe('Reverb client', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('signs listing reads when a token is set, since Reverb refuses unsigned reads from Netlify', async () => {
        vi.stubEnv('REVERB_API_TOKEN', 'test-token');
        const fetchMock = stubFetch();
        const listing = await getReverbListing('103882256');
        expect(listing).toMatchObject({ state: 'live', price: 775, inventory: 1 });
        expect(sentHeaders(fetchMock).Authorization).toBe('Bearer test-token');
    });

    it('reads without a token when none is set', async () => {
        vi.stubEnv('REVERB_API_TOKEN', '');
        const fetchMock = stubFetch();
        await getReverbListing('103882256');
        expect(sentHeaders(fetchMock).Authorization).toBeUndefined();
    });

    it('ends a listing with the no-fee "not sold" reason', async () => {
        vi.stubEnv('REVERB_API_TOKEN', 'test-token');
        const fetchMock = stubFetch({});
        await endReverbListing('103882256');
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://api.reverb.com/api/my/listings/103882256/state/end');
        expect(JSON.parse(String(init.body))).toEqual({ reason: 'not_sold' });
    });

    it('refuses to write without a token', async () => {
        vi.stubEnv('REVERB_API_TOKEN', '');
        stubFetch();
        await expect(endReverbListing('103882256')).rejects.toThrow(/REVERB_API_TOKEN/);
    });
});
