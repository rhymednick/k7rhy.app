// lib/relay.test.ts
import { describe, it, expect } from 'vitest';
import { buildRelayBreadcrumbs, resolveRelayFilePath } from './relay';
import { relayNav } from '@/config/relay-nav';

describe('resolveRelayFilePath', () => {
    it('resolves a normal slug to a file path', () => {
        const result = resolveRelayFilePath('lipstick', ['printing', 'parameters']);
        expect(result).toMatch(/content\/relay\/lipstick\/printing\/parameters\.mdx$/);
    });

    it('resolves empty slug to index.mdx', () => {
        const result = resolveRelayFilePath('lipstick', []);
        expect(result).toMatch(/content\/relay\/lipstick\/index\.mdx$/);
    });
});

describe('buildRelayBreadcrumbs', () => {
    it('builds breadcrumbs for a known page', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['printing', 'parameters'], relayNav);
        expect(crumbs).toEqual([{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: 'Lipstick', href: '/docs/relay/lipstick' }, { label: 'Printing' }, { label: 'Parameters' }]);
    });

    it('builds breadcrumbs for the model root (empty slug)', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs).toEqual([{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: 'Lipstick' }]);
    });

    it('falls back to slug segment when page not found in nav', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', ['unknown', 'page'], relayNav);
        expect(crumbs).toHaveLength(4);
        expect(crumbs[2]).toEqual({ label: 'Lipstick', href: '/docs/relay/lipstick' });
        const last = crumbs[crumbs.length - 1];
        expect(last.label).toBe('page');
        expect(last.href).toBeUndefined();
    });
});
