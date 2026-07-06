import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayVoicingTabs } from '@/components/relay/relay-voicing-tabs';
import { loadRelayPlatformSectionPage, loadRelayWiringPage, listVoicingsWithWiring } from '@/lib/relay';
import { relayVoicings } from '@/config/relay-voicings';

type Props = { searchParams: Promise<{ voicing?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['wiring', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayWiringPage({ searchParams }: Props) {
    const { voicing } = await searchParams;
    const buildable = listVoicingsWithWiring();
    const requested = voicing ?? '';
    const active = buildable.includes(requested) ? requested : buildable[0];
    const tabs = buildable.map((slug) => ({ slug, name: relayVoicings.find((v) => v.slug === slug)!.name }));
    const intro = loadRelayPlatformSectionPage(['wiring', 'index']);
    const wiring = loadRelayWiringPage(active);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Wiring' }];

    return (
        <DocPage title={intro.frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={intro.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayVoicingTabs voicings={tabs} activeSlug={active} basePath="/relay/wiring" />
            <MDXRemote source={wiring.content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
