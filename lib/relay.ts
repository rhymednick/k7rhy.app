import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { RelayNav, RelayPlatformNav } from '@/types/relay-nav';

export interface RelayPageFrontmatter {
    title: string;
    description: string;
}

export interface RelayBreadcrumb {
    label: string;
    href?: string;
}

/** Resolves the absolute path to an MDX file given a model and slug segments. */
export function resolveRelayFilePath(model: string, slug: string[]): string {
    const segments = slug.length > 0 ? slug : ['index'];
    return path.join(process.cwd(), 'content', 'relay', model, ...segments) + '.mdx';
}

/** Resolves the absolute path to a platform-level MDX file (e.g. printing/overview). */
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

/** Loads a model MDX page. */
export function loadRelayPage(model: string, slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(resolveRelayFilePath(model, slug));
}

/** Loads the platform-level index page (content/relay/index.mdx). */
export function loadRelayPlatformPage(): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(path.join(process.cwd(), 'content', 'relay', 'index.mdx'));
}

/** Loads a platform-level section page (e.g. printing/overview → content/relay/printing/overview.mdx). */
export function loadRelayPlatformSectionPage(slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    return loadMdxFile(resolveRelayPlatformFilePath(slug));
}

/** Builds breadcrumbs for a platform section page. */
export function buildRelayPlatformBreadcrumbs(slug: string[], nav: RelayPlatformNav): RelayBreadcrumb[] {
    const pageSlug = slug.join('/');
    let pageTitle: string | undefined;
    let sectionTitle: string | undefined;

    for (const section of nav.sections) {
        const item = section.items?.find((i) => i.slug === pageSlug);
        if (item) {
            pageTitle = item.title;
            sectionTitle = section.title;
            break;
        }
    }

    return [{ label: 'Relay Guitar', href: '/relay' }, ...(sectionTitle ? [{ label: sectionTitle }] : []), { label: pageTitle ?? slug[slug.length - 1] }];
}

/** Builds breadcrumb trail for a model page. */
export function buildRelayBreadcrumbs(model: string, slug: string[], nav: RelayNav): RelayBreadcrumb[] {
    if (slug.length === 0) {
        return [{ label: 'Relay Guitar', href: '/relay' }, { label: nav[model]?.title ?? model }];
    }

    const modelNav = nav[model];
    const pageSlug = slug.join('/');

    let pageTitle: string | undefined;
    let sectionTitle: string | undefined;

    for (const section of modelNav?.sections ?? []) {
        const item = section.items?.find((i) => i.slug === pageSlug);
        if (item) {
            pageTitle = item.title;
            sectionTitle = section.title;
            break;
        }
    }

    return [{ label: 'Relay Guitar', href: '/relay' }, { label: modelNav?.title ?? model, href: `/relay/${model}` }, ...(sectionTitle && sectionTitle !== modelNav?.title ? [{ label: sectionTitle }] : []), { label: pageTitle ?? slug[slug.length - 1] }];
}
