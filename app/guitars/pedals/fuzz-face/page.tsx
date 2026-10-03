import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import components from '@/components/mdx-components';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';

// Unlisted until the kit is released: reachable by URL only, not indexed, not in navigation or the sitemap.
export const metadata: Metadata = {
    title: 'Fuzz Face Kit Assembly Guide | K7RHY',
    robots: { index: false, follow: false },
};

function loadGuide() {
    const source = fs.readFileSync(path.join(process.cwd(), 'content/pedals/fuzz-face.mdx'), 'utf-8');
    return matter(source);
}

export default function FuzzFaceGuidePage() {
    const { content, data } = loadGuide();
    const breadcrumbItems = [{ href: '/guitars', label: 'Guitars' }, { href: '/guitars/pedals', label: 'Pedals' }, { label: data.title }];

    return (
        <DocPage title={data.title} subTitle={data.subTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </DocPage>
    );
}
