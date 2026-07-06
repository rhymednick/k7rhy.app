import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { RelayVoicing } from '@/types/relay-voicing';

export interface RelayPageFrontmatter {
    title: string;
    description: string;
    voicing?: string;
}

export interface RelayBreadcrumb {
    label: string;
    href?: string;
}

/** Resolves the absolute path to an MDX file given a voicing slug and optional sub-page slug segments. */
export function resolveRelayVoicingFilePath(voicing: string, slug: string[]): string {
    const segments = slug.length > 0 ? slug : ['index'];
    return path.join(process.cwd(), 'content', 'relay', 'voicings', voicing, ...segments) + '.mdx';
}

/** Resolves the absolute path to a platform-level MDX file (e.g. body/overview). */
export function resolveRelayPlatformFilePath(slug: string[]): string {
    return path.join(process.cwd(), 'content', 'relay', ...slug) + '.mdx';
}

function loadMdxFile(filePath: string): { content: string; frontmatter: RelayPageFrontmatter } {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Relay page not found: ${filePath}`);
    }
    const source = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(source);
    if (!data.title || !data.description) {
        throw new Error(`Relay page at ${filePath} is missing required frontmatter fields (title, description)`);
    }
    return { content, frontmatter: data as RelayPageFrontmatter };
}

/** Loads a voicing MDX page. */
export function loadRelayVoicingPage(voicing: string, slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(resolveRelayVoicingFilePath(voicing, slug));
}

/** Loads the platform-level index page (content/relay/index.mdx). */
export function loadRelayPlatformPage(): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'index.mdx'));
}

/** Loads the voicings gallery index page (content/relay/voicings/index.mdx). */
export function loadRelayVoicingsGalleryPage(): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'voicings', 'index.mdx'));
}

/** Loads a platform-level section page (e.g. body/overview → content/relay/body/overview.mdx). */
export function loadRelayPlatformSectionPage(slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(resolveRelayPlatformFilePath(slug));
}

/** Builds breadcrumb trail for a voicing page. */
export function buildRelayVoicingBreadcrumbs(voicing: string, slug: string[], voicings: RelayVoicing[]): RelayBreadcrumb[] {
    const entry = voicings.find((v) => v.slug === voicing);
    const title = entry?.name ?? voicing;

    if (slug.length === 0) {
        return [{ label: 'Relay Guitar', href: '/relay' }, { label: title }];
    }

    const pageSlug = slug.join('/');
    const doc = entry?.docs.find((d) => d.slug === pageSlug);

    return [
        { label: 'Relay Guitar', href: '/relay' },
        { label: title, href: `/relay/voicings/${voicing}` },
        { label: doc?.title ?? slug[slug.length - 1] },
    ];
}
