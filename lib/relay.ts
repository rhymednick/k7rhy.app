// lib/relay.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { RelayNav } from '@/types/relay-nav';

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

/**
 * Loads an MDX file and returns its raw content string and typed frontmatter.
 * Synchronous — server-side use only (Next.js RSC / static generation).
 */
export function loadRelayPage(model: string, slug: string[]): { content: string; frontmatter: RelayPageFrontmatter } {
    const filePath = resolveRelayFilePath(model, slug);
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

/** Builds breadcrumb trail from URL model + slug segments using the nav config for titles. */
export function buildRelayBreadcrumbs(model: string, slug: string[], nav: RelayNav): RelayBreadcrumb[] {
    // Model root: no slug
    if (slug.length === 0) {
        return [{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: nav[model]?.title ?? model }];
    }

    const modelNav = nav[model];
    const pageSlug = slug.join('/');

    let pageTitle: string | undefined;
    let sectionTitle: string | undefined;

    for (const section of modelNav?.sections ?? []) {
        const item = section.items.find((i) => i.slug === pageSlug);
        if (item) {
            pageTitle = item.title;
            sectionTitle = section.title;
            break;
        }
    }

    return [{ label: 'Docs', href: '/docs' }, { label: 'Relay Guitar', href: '/docs/relay' }, { label: modelNav?.title ?? model, href: `/docs/relay/${model}` }, ...(sectionTitle ? [{ label: sectionTitle }] : []), { label: pageTitle ?? slug[slug.length - 1] }];
}
