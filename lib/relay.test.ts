import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, buildRelayPlatformBreadcrumbs, loadRelayVoicingPage, loadRelayVoicingsGalleryPage } from '@/lib/relay';
import { relayNav, relayPlatformNav } from '@/config/relay-nav';

describe('resolveRelayVoicingFilePath', () => {
    it('resolves voicing index path when slug is empty', () => {
        const result = resolveRelayVoicingFilePath('lipstick', []);
        expect(result).toContain(path.join('content', 'relay', 'voicings', 'lipstick', 'index.mdx'));
    });

    it('resolves voicing sub-page path', () => {
        const result = resolveRelayVoicingFilePath('lipstick', ['bom']);
        expect(result).toContain(path.join('content', 'relay', 'voicings', 'lipstick', 'bom.mdx'));
    });
});

describe('loadRelayVoicingPage', () => {
    it('loads voicing frontmatter with the voicing slug used by the overview component', () => {
        const { frontmatter } = loadRelayVoicingPage('velvet', []);

        expect(frontmatter.voicing).toBe('velvet');
    });
});

describe('loadRelayVoicingsGalleryPage', () => {
    it('loads the voicings gallery frontmatter', () => {
        const { frontmatter } = loadRelayVoicingsGalleryPage();
        expect(frontmatter.title).toBe('Voicings');
    });
});

describe('resolveRelayPlatformFilePath', () => {
    it('resolves platform section path', () => {
        const result = resolveRelayPlatformFilePath(['body', 'overview']);
        expect(result).toContain(path.join('content', 'relay', 'body', 'overview.mdx'));
    });
});

describe('buildRelayVoicingBreadcrumbs', () => {
    it('builds breadcrumbs for voicing root page', () => {
        const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs).toEqual([{ label: 'Relay Guitar', href: '/relay' }, { label: 'Relay Lipstick' }]);
    });

    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayNav);
        expect(crumbs[0].href).toBe('/relay');
        expect(crumbs[0].href).not.toContain('/docs/');
    });
});

describe('buildRelayPlatformBreadcrumbs', () => {
    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayPlatformBreadcrumbs(['body', 'overview'], relayPlatformNav);
        const relayLink = crumbs.find((c) => c.href?.includes('relay'));
        expect(relayLink?.href).toBe('/relay');
        expect(relayLink?.href).not.toContain('/docs/');
    });
});
