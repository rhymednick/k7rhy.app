import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { RelayComponentsShoppingList } from '@/components/relay/relay-components-shopping-list';
import { loadRelayPlatformSectionPage } from '@/lib/relay';
import { resolveRelayComponentList } from '@/lib/relay-components';

type Props = { searchParams: Promise<{ model?: string }> };

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
    const { model } = await searchParams;
    const { content, frontmatter } = loadRelayPlatformSectionPage(['components', 'index']);
    const resolvedList = resolveRelayComponentList(model);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Components' }];

    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <RelayComponentsShoppingList components={resolvedList.components} allModelSpecificComponents={resolvedList.allModelSpecificComponents} initialModel={resolvedList.selectedModel} />
        </DocPage>
    );
}
