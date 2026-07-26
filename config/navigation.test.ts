import { describe, expect, it } from 'vitest';
import { navConfig } from './navigation';

describe('main navigation', () => {
    it('organizes the site by subject, shopping, and community', () => {
        expect(navConfig.mainNav).toEqual([
            { title: 'Ham Radio', href: '/ham-radio' },
            { title: 'Guitars', href: '/guitars' },
            { title: 'Shop', href: '/shop' },
            { title: 'Community', href: '/community' },
        ]);
    });

    it('keeps radio docs in the radio-specific navigation group', () => {
        expect(navConfig.hamRadioNav.flatMap((group) => group.items).map((item) => item.href)).toEqual(['/docs/dl20w_bnc', '/docs/power_measurement']);
    });
});
