'use client';

import { Blog } from '@/.content-collections/generated';
import React, { useState, useMemo } from 'react';
import TagFilter from './tag-filter';
import { BlogCard } from './blog-card';

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

        const filtered = selectedTags.length === 0 ? basePosts : basePosts.filter((post) => selectedTags.every((tag) => post.tags?.includes(tag)));

        // Sort posts by date, newest first
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    }, [filteredPosts]);

    // Handle tag selection
    const toggleTag = (tag: string) => {
        setSelectedTags((prevSelected) => (prevSelected.includes(tag) ? prevSelected.filter((t) => t !== tag) : [...prevSelected, tag]));
    };

    // Clear all selected tags
    const clearTags = () => setSelectedTags([]);

    // Determine disabled tags (those that would result in an empty list if selected)
    const disabledTags = useMemo(() => {
        return sortedTags.filter((tag) => {
            const potentialSelectedTags = [...selectedTags, tag];
            return posts.every((post) => !potentialSelectedTags.every((t) => post.tags?.includes(t)));
        });
    }, [sortedTags, selectedTags, posts]);

    return (
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 md:px-8 lg:py-12 xl:px-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Lab Notes</h1>
                <p className="mt-2 text-lg text-muted-foreground">Field logs from personal experiments, prototypes, and builds in progress.</p>
            </header>

            <TagFilter tags={sortedTags} selectedTags={selectedTags} disabledTags={disabledTags} onToggleTag={toggleTag} onClearTags={clearTags} />

            {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <BlogCard key={post._meta.path} post={post} />
                    ))}
                </div>
            ) : (
                <p className="py-12 text-center text-muted-foreground">No posts match the selected filters.</p>
            )}
        </main>
    );
};

export default BlogIndex;
