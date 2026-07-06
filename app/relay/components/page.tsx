import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayComponentsShoppingList } from '@/components/relay/relay-components-shopping-list';
import { loadRelayPlatformSectionPage } from '@/lib/relay';
import { resolveRelayComponentList } from '@/lib/relay-components';

type Props = { searchParams: Promise<{ voicing?: string; model?: string }> };

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);
        return {
            title: `${frontmatter.title} | Relay Guitar | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayComponentsPage({ searchParams }: Props) {
    // `model` is the legacy query param name; `voicing` wins when both are present.
    const { voicing, model } = await searchParams;
    const selectedVoicing = voicing ?? model;
    const { content, frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);
    const resolvedList = resolveRelayComponentList(selectedVoicing);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Components' }];

    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayComponentsShoppingList components={resolvedList.components} allModelSpecificComponents={resolvedList.allModelSpecificComponents} initialVoicing={resolvedList.selectedModel} />
        </DocPage>
    );
}
