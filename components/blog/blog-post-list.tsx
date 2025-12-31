import { Blog } from '@/.content-collections/generated';
import React from 'react';
import BlogPostItem from './blog-post-item'; // Adjusted naming convention

interface PostListProps {
    posts: Blog[];
}

const BlogPostList: React.FC<PostListProps> = ({ posts }) => {
    return (
        <div className="space-y-8">
            {posts.map((post) => (
                <BlogPostItem key={post._meta.path} post={post} />
            ))}
        </div>
    );
};

export default BlogPostList;
