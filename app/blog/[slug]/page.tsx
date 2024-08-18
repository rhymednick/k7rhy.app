import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import components from '@/components/mdx-components'; // Ensure the correct path to your mdx-components.tsx
import { BlogPage } from '@/components/blog-page';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


type BlogProps = {
    params: {
        slug: string;
    };
};

export async function generateStaticParams() {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/blog'));

    return files.map((filename) => ({
        slug: filename.replace('.mdx', ''),
    }));
}


const unpublishedAlert = () => {
    return (
        <Alert variant="destructive" className='dark:text-red-600 max-w-[450px] mx-auto'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle className='dark:font-bold'>Unpublished Topic Warning</AlertTitle>
            <AlertDescription className='text-slate-800 dark:text-slate-200 pt-1'>
                <p>This topic is not published and not visible to the public.</p>
                <p>Publish by adding <code className='p-1 bg-slate-200 font-bold text-slate-600 dark:text-slate-400 '>publish: true</code> to the frontmatter.</p>
            </AlertDescription>
        </Alert>
    );;
}
const Page = ({ params }: BlogProps) => {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    const { slug } = params;
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
        console.log('File not found');
        notFound();
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    const { content, data } = matter(source);

    // Check if the post is unpublished and if it's in production (or overridden env)
    if (environment === 'production' && !data.publish) {
        console.log('Unpublished post, returning 404 in production');
        notFound(); // This will trigger a 404 error
    }

    return (
        <BlogPage title={data.title} date={data.date}>
            {(!data.publish) && unpublishedAlert()}
            <MDXRemote source={content} components={components} />
        </BlogPage>
    );
}
export default Page;