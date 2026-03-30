import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPage, buildRelayBreadcrumbs } from '@/lib/relay';
import { relayNav } from '@/config/relay-nav';

type Props = { params: Promise<{ model: string; slug: string[] }> };

export function generateStaticParams() {
    return Object.entries(relayNav).flatMap(([model, modelNav]) =>
        modelNav.sections.flatMap((section) =>
            section.items.map((item) => ({
                model,
                slug: item.slug.split('/'),
            }))
        )
    );
}

export async function generateMetadata({ params }: Props) {
    const { model, slug } = await params;
    try {
        const { frontmatter } = loadRelayPage(model, slug);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayPage({ params }: Props) {
    const { model, slug } = await params;
    let content: string;
    let frontmatter: { title: string; description: string };
    try {
        ({ content, frontmatter } = loadRelayPage(model, slug));
    } catch {
        notFound();
    }
    const breadcrumbs = buildRelayBreadcrumbs(model, slug, relayNav);
    return (
        <DocPage title={frontmatter!.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content!} components={components} />
        </DocPage>
    );
}
