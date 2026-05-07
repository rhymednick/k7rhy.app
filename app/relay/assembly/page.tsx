import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPlatformSectionPage } from '@/lib/relay';

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['assembly', 'index']);
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayAssemblyPage() {
    const { content, frontmatter } = loadRelayPlatformSectionPage(['assembly', 'index']);
    const breadcrumbs = [{ label: 'Relay Guitar', href: '/relay' }, { label: 'Assembly' }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
