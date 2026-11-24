import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage } from '@/components/doc/doc-page';
import { RelayBreadcrumbBar } from '@/components/navigation/relay-sidebar';
import { loadRelayPlatformSectionPage } from '@/lib/relay';

export async function generateMetadata() {
    try {
        const { frontmatter } = loadRelayPlatformSectionPage(['customize', 'direct-off-reactive-switch']);
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function RelayCustomizeDirectOffReactiveSwitchPage() {
    const { content, frontmatter } = loadRelayPlatformSectionPage(['customize', 'direct-off-reactive-switch']);
    const breadcrumbs = [{ label: 'Guitars', href: '/guitars' }, { label: 'Relay', href: '/guitars/relay' }, { label: 'Customize', href: '/guitars/relay/customize' }, { label: 'Direct / Off / Reactive switch' }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<RelayBreadcrumbBar items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
