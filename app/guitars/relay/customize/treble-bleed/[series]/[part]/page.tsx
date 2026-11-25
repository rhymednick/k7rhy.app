import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelaySeriesNav } from '@/components/relay/relay-series-nav';
import { getRelayCustomizePart, relayCustomize } from '@/config/relay-customize';
import { loadRelayPlatformSectionPage } from '@/lib/relay';

type Props = { params: Promise<{ series: string; part: string }> };

export function generateStaticParams() {
    return relayCustomize.series.flatMap((series) => series.parts.map((part) => ({ series: series.slug, part: part.slug })));
}

export async function generateMetadata({ params }: Props) {
    const { series, part } = await params;
    if (!getRelayCustomizePart(series, part)) return {};
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['customize', relayCustomize.topic.slug, series, part]);
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayCustomizePartPage({ params }: Props) {
    const { series, part } = await params;
    const found = getRelayCustomizePart(series, part);
    if (!found) notFound();
    const { content, frontmatter } = loadRelayPlatformSectionPage(['customize', relayCustomize.topic.slug, series, part]);
    const breadcrumbs = [{ label: 'Guitars', href: '/guitars' }, { label: 'Relay', href: '/guitars/relay' }, { label: 'Customize', href: relayCustomize.href }, { label: found.series.title }, { label: found.part.title }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {relayCustomize.topic.title} · {found.series.title} · Part {found.index + 1} of {found.total}
            </p>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelaySeriesNav prev={found.prev} next={found.next} />
        </DocPage>
    );
}
