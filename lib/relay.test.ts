import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveRelayVoicingFilePath, resolveRelayPlatformFilePath, buildRelayVoicingBreadcrumbs, loadRelayVoicingPage, loadRelayVoicingsGalleryPage, loadRelayPlatformSectionPage } from '@/lib/relay';
import { relayVoicings } from '@/config/relay-voicings';

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

describe('loadRelayPlatformSectionPage', () => {
    it('loads the Relay parts page frontmatter', () => {
        const { frontmatter } = loadRelayPlatformSectionPage(['parts', 'index']);

        expect(frontmatter.title).toBe('Parts');
        expect(frontmatter.description).toContain('parts list');
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
        const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayVoicings);
        expect(crumbs).toEqual([{ label: 'Relay Guitar', href: '/relay' }, { label: 'Relay Lipstick' }]);
    });

    it('first breadcrumb links to /relay not /docs/relay', () => {
        const crumbs = buildRelayVoicingBreadcrumbs('lipstick', [], relayVoicings);
        expect(crumbs[0].href).toBe('/relay');
        expect(crumbs[0].href).not.toContain('/docs/');
    });

    it('titles doc sub-pages from the registry docs list', () => {
        const crumbs = buildRelayVoicingBreadcrumbs('arc', ['wiring'], relayVoicings);
        expect(crumbs).toEqual([{ label: 'Relay Guitar', href: '/relay' }, { label: 'Relay Arc', href: '/relay/voicings/arc' }, { label: 'Wiring Guide' }]);
    });

    it('falls back to the raw slug for unknown pages', () => {
        const crumbs = buildRelayVoicingBreadcrumbs('arc', ['mystery'], relayVoicings);
        expect(crumbs[crumbs.length - 1]).toEqual({ label: 'mystery' });
    });
});
