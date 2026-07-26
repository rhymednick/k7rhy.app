import { describe, expect, it } from 'vitest';
import { nextConfig } from './next.config.mjs';

describe('route migrations', () => {
    it('redirects legacy public sections directly to canonical routes', async () => {
        const redirects = await nextConfig.redirects!();

        expect(redirects).toEqual(
            expect.arrayContaining([
                { source: '/products', destination: '/shop', permanent: true },
                { source: '/products/:path*', destination: '/shop/:path*', permanent: true },
                { source: '/relay', destination: '/guitars/relay', permanent: true },
                { source: '/relay/:path*', destination: '/guitars/relay/:path*', permanent: true },
                { source: '/blog', destination: '/community', permanent: true },
            ])
        );
    });

    it('does not redirect retired posts or private serial records', async () => {
        const redirects = await nextConfig.redirects!();

        expect(redirects).not.toEqual(expect.arrayContaining([expect.objectContaining({ source: '/blog/:path*' })]));
        expect(redirects).not.toEqual(expect.arrayContaining([expect.objectContaining({ source: '/sn/:path*' })]));
    });
});
