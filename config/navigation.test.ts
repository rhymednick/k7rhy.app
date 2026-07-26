import { describe, expect, it, vi } from 'vitest';

vi.mock('content-collections', () => ({ allBlogs: [] }));
vi.mock('@/.content-collections/generated', () => ({ Blog: {} }));

import { navConfig } from './navigation';

describe('navConfig.mainNav', () => {
    it('includes a Coupeville entry pointing at /coupeville', () => {
        expect(navConfig.mainNav).toContainEqual({ title: 'Coupeville', href: '/coupeville' });
    });

    it('keeps Coupeville next to Relay Guitar', () => {
        const titles = navConfig.mainNav.map((item) => item.title);
        expect(titles.indexOf('Coupeville')).toBe(titles.indexOf('Relay Guitar') + 1);
    });
});
