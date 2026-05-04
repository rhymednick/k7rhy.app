import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveRelayFilePath, resolveRelayPlatformFilePath, buildRelayBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayPage } from '@/lib/relay';
import { relayNav, relayPlatformNav } from '@/config/relay-nav';

describe('resolveRelayFilePath', () => {
    it('resolves model index path when slug is empty', () => {
        const result = resolveRelayFilePath('lipstick', []);
        expect(result).toContain(path.join('content', 'relay', 'lipstick', 'index.mdx'));
    });

    it('resolves model sub-page path', () => {
        const result = resolveRelayFilePath('lipstick', ['bom']);
        expect(result).toContain(path.join('content', 'relay', 'lipstick', 'bom.mdx'));
    });
});

describe('loadRelayPage', () => {
    it('loads model frontmatter with the model key used by the overview component', () => {
        const { frontmatter } = loadRelayPage('velvet', []);

        expect(frontmatter.model).toBe('velvet');
    });
});

describe('resolveRelayPlatformFilePath', () => {
    it('resolves platform section path', () => {
        const result = resolveRelayPlatformFilePath(['build', 'print']);
        expect(result).toContain(path.join('content', 'relay', 'build', 'print.mdx'));
    });
});

describe('buildRelayBreadcrumbs', () => {
    it('builds breadcrumbs for model root page', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs).toEqual([{ label: 'Relay Guitar', href: '/relay' }, { label: 'Relay Lipstick' }]);
    });

    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs[0].href).toBe('/relay');
        expect(crumbs[0].href).not.toContain('/docs/');
    });
});

describe('buildRelayPlatformBreadcrumbs', () => {
    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayPlatformBreadcrumbs(['build', 'print'], relayPlatformNav);
        const relayLink = crumbs.find((c) => c.href?.includes('relay'));
        expect(relayLink?.href).toBe('/relay');
        expect(relayLink?.href).not.toContain('/docs/');
    });
});
