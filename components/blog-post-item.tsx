import { Blog } from '@/.content-collections/generated';
import Link from 'next/link';
import React from 'react';

interface BlogPostItemProps {
    post: Blog;
}

const BlogPostItem: React.FC<BlogPostItemProps> = ({ post }) => {
    return (
        <article className="relative group">
            <div className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl group-hover:bg-blue-100/20 dark:group-hover:bg-slate-800/40" />
            <svg
                viewBox="0 0 9 9"
                className="hidden absolute right-full mr-6 top-2 text-slate-200 dark:text-slate-600 md:mr-12 w-[calc(0.5rem+1px)] h-[calc(0.5rem+1px)] overflow-visible sm:block"
            >
                <circle
                    cx="4.5"
                    cy="4.5"
                    r="4.5"
                    stroke="currentColor"
                    className="fill-white dark:fill-slate-900"
                    strokeWidth="2"
                ></circle>
            </svg>
            {post.publish === false && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 text-red-500 font-bold text-6xl z-0">
                    Unpublished
                </div>
            )}
            <div className="relative z-10">
                <div className="flex flex-col">
                    <h3
                        className={`text-base md:text-xl font-semibold tracking-tight ${
                            post.publish === false ? 'opacity-60' : ''
                        } text-slate-900 dark:text-slate-200 pt-8 lg:pt-0`}
                    >
                        {post.title}
                    </h3>
                    {post.tags && (
                        <div className="mt-1 space-x-2 text-xs text-slate-400 dark:text-slate-500 flex flex-wrap">
                            {post.isAISummary && (
                                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium mr-1 px-2 py-0.5 rounded">
                                    #AI-generated Summary
                                </span>
                            )}
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-block bg-green-100 text-green-700 text-xs font-medium mr-1 px-2 py-0.5 rounded"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-2 mb-4 prose prose-slate prose-a:relative prose-a:z-10 dark:prose-dark">
                    {post.summary}
                    <div className="text-xs text-gray-400 dark:text-gray-600 italic pt-2">
                        <span>{`Word Count: ${post.wordCount}`}</span> |{' '}
                        <span>{`Estimated Reading Time: ${post.readingTime} min.`}</span>
                    </div>
                </div>

                <dl className="absolute left-0 top-0 lg:left-auto lg:right-full lg:mr-[calc(6.5rem+1px)] opacity-60">
                    <dt className="sr-only">Date</dt>
                    <dd className="whitespace-nowrap text-sm leading-6 dark:text-slate-400">
                        <time dateTime={new Date(post.date).toISOString()}>
                            {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short', // Abbreviated month name
                                day: 'numeric',
                            })}
                        </time>
                    </dd>
                </dl>
            </div>

            <Link
                href={`/blog/${post._meta.path}`}
                className="flex items-center text-sm text-blue-400 font-medium cursor-pointer"
            >
                <span className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl"></span>
                <span className="relative">
                    Read more
                    <span className="sr-only">, {post.summary}</span>
                </span>
                <svg
                    className="relative mt-px overflow-visible ml-2.5 text-blue-400 dark:text-sky-700"
                    width="3"
                    height="6"
                    viewBox="0 0 3 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M0 0L3 3L0 6"></path>
                </svg>
            </Link>
        </article>
    );
};

export default BlogPostItem;
