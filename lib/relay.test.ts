// lib/relay.test.ts
import { describe, it, expect } from 'vitest';
import { buildRelayBreadcrumbs, resolveRelayFilePath } from './relay';
import { relayNav } from '@/config/relay-nav';

describe('resolveRelayFilePath', () => {
    it('resolves a normal slug to a file path', () => {
        const result = resolveRelayFilePath('lipstick', ['electronics', 'wiring']);
        expect(result).toMatch(/content\/relay\/lipstick\/electronics\/wiring\.mdx$/);
    });

    it('resolves empty slug to index.mdx', () => {
        const result = resolveRelayFilePath('lipstick', []);
        expect(result).toMatch(/content\/relay\/lipstick\/index\.mdx$/);
    });
});

describe('buildRelayBreadcrumbs', () => {
    it('builds breadcrumbs for a known model page', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['electronics', 'wiring'], relayNav);
        expect(crumbs).toEqual([
            { label: 'Docs', href: '/docs' },
            { label: 'Relay Guitar Platform', href: '/docs/relay' },
            { label: 'Relay Lipstick', href: '/docs/relay/lipstick' },
            { label: 'Electronics' },
            { label: 'Wiring' },
        ]);
    });

    it('builds breadcrumbs for the model root (empty slug)', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs).toEqual([
            { label: 'Docs', href: '/docs' },
            { label: 'Relay Guitar Platform', href: '/docs/relay' },
            { label: 'Relay Lipstick' },
        ]);
    });

    it('falls back to slug segment when page not found in nav', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['unknown', 'page'], relayNav);
        expect(crumbs).toHaveLength(4);
        expect(crumbs[2]).toEqual({ label: 'Relay Lipstick', href: '/docs/relay/lipstick' });
        const last = crumbs[crumbs.length - 1];
        expect(last.label).toBe('page');
        expect(last.href).toBeUndefined();
    });
});
