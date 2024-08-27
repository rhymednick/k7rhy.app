'use client';

import { Blog } from '@/.content-collections/generated';
import React, { useState, useMemo } from 'react';
import TagFilter from './tag-filter'; // Adjusted naming convention
import BlogPostList from './blog-post-list'; // Adjusted naming convention
import BlogHeader from './blog-header';

interface BlogIndexPageProps {
    posts: Blog[];
}

const BlogIndex: React.FC<BlogIndexPageProps> = ({ posts }) => {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    // State for selected tags
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Filter and sort posts based on environment, publish status, selected tags (exclusive filtering), and date
    const filteredPosts = useMemo(() => {
        const basePosts =
            environment === 'production'
                ? posts.filter((post) => post.publish) // Only show published posts in production
                : posts; // Show all posts in non-production environments

        const filtered =
            selectedTags.length === 0
                ? basePosts
                : basePosts.filter((post) =>
                      selectedTags.every((tag) => post.tags?.includes(tag))
                  );

        // Sort posts by date, newest first
        return filtered.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [posts, environment, selectedTags]);
    // Extract and sort tags by frequency
    const sortedTags = useMemo(() => {
        const tagCount: Record<string, number> = {};
        filteredPosts.forEach((post) =>
            post.tags?.forEach((tag) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            })
        );

        return Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
    }, [posts]);

    // Handle tag selection
    const toggleTag = (tag: string) => {
        setSelectedTags((prevSelected) =>
            prevSelected.includes(tag)
                ? prevSelected.filter((t) => t !== tag)
                : [...prevSelected, tag]
        );
    };

    // Clear all selected tags
    const clearTags = () => setSelectedTags([]);

    // Determine disabled tags (those that would result in an empty list if selected)
    const disabledTags = useMemo(() => {
        return sortedTags.filter((tag) => {
            const potentialSelectedTags = [...selectedTags, tag];
            return posts.every(
                (post) =>
                    !potentialSelectedTags.every((t) => post.tags?.includes(t))
            );
        });
    }, [sortedTags, selectedTags, posts]);

    return (
        <main className="lg:py-12 mx-auto max-w-2xl px-4 pb-28 sm:px-6 md:px-8 xl:px-12">
            <BlogHeader />

            {/* Use TagFilter Component */}
            <TagFilter
                tags={sortedTags}
                selectedTags={selectedTags}
                disabledTags={disabledTags}
                onToggleTag={toggleTag}
                onClearTags={clearTags}
            />

            {/* Use PostList Component */}
            <div className="relative sm:pb-12">
                <div className="hidden absolute top-3 bottom-0 right-full mr-7 md:mr-[3.25rem] w-px bg-slate-200 dark:bg-slate-800 sm:block" />
                <BlogPostList posts={filteredPosts} />
            </div>
        </main>
    );
};

export default BlogIndex;
