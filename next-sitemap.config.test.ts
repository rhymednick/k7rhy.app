import { describe, expect, it } from 'vitest';
import config from './next-sitemap.config.js';

describe('sitemap visibility', () => {
    it('excludes every private serial route', async () => {
        expect(await config.transform!(config, '/sn/CVL26001')).toBeNull();
        expect(await config.transform!(config, '/sn/CVL26001/print')).toBeNull();
    });

    it('excludes unlisted pedal kit guides', async () => {
        expect(await config.transform!(config, '/guitars/pedals')).toBeNull();
        expect(await config.transform!(config, '/guitars/pedals/fuzz-face')).toBeNull();
        expect(await config.transform!(config, '/guitars/pedals/bazz-fuss')).toBeNull();
        expect(await config.transform!(config, '/guitars/pedals/electra')).toBeNull();
        expect(await config.transform!(config, '/guitars/pedals/bosstone')).toBeNull();
    });

    it('includes the new public destinations', async () => {
        expect(await config.transform!(config, '/community')).toMatchObject({ loc: '/community' });
        expect(await config.transform!(config, '/shop')).toMatchObject({ loc: '/shop' });
    });
});
