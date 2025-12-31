import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import components from '@/components/mdx-components'; // Ensure the correct path to your mdx-components.tsx
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';

type MdxDocProps = {
    params: Promise<{
        slug: string;
    }>;
};

export async function generateStaticParams() {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/docs'));

    return files.map((filename) => ({
        slug: filename.replace('.mdx', ''),
    }));
}

const Page = async ({ params }: MdxDocProps) => {
    //const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'content/docs', `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        console.log('File not found: ', filePath);
        notFound();
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(source);
    const breadcrumbItems = [{ href: '/docs', label: 'Docs' }, { label: data.title }];

    return (
        <DocPage title={data.title} subTitle={data.subTitle} date={data.date} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
            <MDXRemote source={content} components={components} />
        </DocPage>
    );
};
export default Page;
