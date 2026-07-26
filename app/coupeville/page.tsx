import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { loadCoupevilleLandingPage } from '@/lib/coupeville';

export async function generateMetadata() {
    try {
        const { frontmatter } = loadCoupevilleLandingPage();
        return {
            title: `${frontmatter.title} | K7RHY`,
            description: frontmatter.description,
            openGraph: { title: frontmatter.title, description: frontmatter.description },
        };
    } catch {
        return {};
    }
}

export default async function CoupevillePage() {
    const { content, frontmatter } = loadCoupevilleLandingPage();
    const breadcrumbs = [{ label: 'Coupeville' }];
    return (
        <DocPage title={frontmatter.title} breadcrumbs={<MyBreadcrumbs items={breadcrumbs} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
