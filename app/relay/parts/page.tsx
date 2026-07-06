import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayComponentsShoppingList } from '@/components/relay/relay-components-shopping-list';
import { RelayVoicingTabs } from '@/components/relay/relay-voicing-tabs';
import { loadRelayPlatformSectionPage } from '@/lib/relay';
import { listVoicingsWithParts, resolveRelayComponentList } from '@/lib/relay-components';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { searchParams: Promise<{ voicing?: string; model?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['parts', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayPartsPage({ searchParams }: Props) {
    const { voicing, model } = await searchParams;
    const buildable = listVoicingsWithParts();
    const requested = voicing ?? model ?? '';
    const active = buildable.includes(requested) ? requested : buildable[0];
    const tabs = buildable.map((slug) => ({ slug, name: relayVoicings.find((v) => v.slug === slug)!.name }));
    const { content, frontmatter } = loadRelayPlatformSectionPage(['parts', 'index']);
    const resolvedList = resolveRelayComponentList(active);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Parts' }];

    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayVoicingTabs voicings={tabs} activeSlug={active} basePath="/relay/parts" />
            <RelayComponentsShoppingList components={resolvedList.components} />
        </DocPage>
    );
}
