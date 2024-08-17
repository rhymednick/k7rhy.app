import React from 'react';
import BlogIndexPage from '@/components/blog-index-page';
import { allBlogs } from 'content-collections';
import { cn } from "@/lib/utils";

const Page = async () => {
    // Fetch the blog posts from the "blog" collection
    //const posts = await getCollection('blog');

    return (
        <BlogIndexPage posts={allBlogs} />
    );
};

export default Page;