import React from 'react';
import BlogIndex from '@/components/blog/blog-index';
import { allBlogs } from 'content-collections';
import { cn } from '@/lib/utils';

const Page = async () => {
    // Fetch the blog posts from the "blog" collection
    //const posts = await getCollection('blog');

    return <BlogIndex posts={allBlogs} />;
};

export default Page;
