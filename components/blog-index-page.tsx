import { Blog } from '@/.content-collections/generated';
import Link from 'next/link';
import React from 'react';

interface BlogIndexPageProps {
    posts: Blog[];
}

const BlogIndex: React.FC<BlogIndexPageProps> = ({ posts }) => {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    // Filter posts based on environment and publish status
    const filteredPosts = environment === 'production'
        ? posts.filter((post) => post.publish) // Only show published posts in production
        : posts; // Show all posts in non-production environments

    return (
        <main className="lg:py-12 mx-auto max-w-2xl px-4 pb-28 sm:px-6 md:px-8 xl:px-12">
            <header className="py-8 sm:text-center">
                <h1 className="mb-4 text-3xl sm:text-4xl tracking-tight text-slate-900 font-bold dark:text-slate-200">
                    Latest Updates
                </h1>
                <p className="text-lg text-slate-700 dark:text-slate-400">All the latest news, straight from K7RHY.</p>
            </header>

            <div className="relative sm:pb-12">
                <div className="hidden absolute top-3 bottom-0 right-full mr-7 md:mr-[3.25rem] w-px bg-slate-200 dark:bg-slate-800 sm:block" />
                <div className="space-y-8"> {/* space between articles */}
                    {filteredPosts.map((post) => (
                        <article
                            key={post._meta.path}
                            className={`relative group ${post.publish === false ? 'opacity-60' : ''}`}
                        >
                            <div className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl group-hover:bg-slate-50/70 dark:group-hover:bg-slate-800/60" />
                            <svg viewBox="0 0 9 9" className="hidden absolute right-full mr-6 top-2 text-slate-200 dark:text-slate-600 md:mr-12 w-[calc(0.5rem+1px)] h-[calc(0.5rem+1px)] overflow-visible sm:block"><circle cx="4.5" cy="4.5" r="4.5" stroke="currentColor" className="fill-white dark:fill-slate-900" strokeWidth="2"></circle></svg>
                            {post.publish === false && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 text-red-500 font-bold text-6xl z-0">
                                    Unpublished
                                </div>
                            )}
                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center">
                                    <h3 className="text-base md:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-200 pt-8 lg:pt-0">
                                        {post.title}
                                    </h3>
                                    {post.tags && (
                                        <div className="mt-1 lg:mt-0 lg:ml-4 space-x-2 text-xs text-slate-400 dark:text-slate-500 flex flex-wrap lg:flex-nowrap">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-block bg-blue-100 text-blue-600 text-xs font-medium mr-1 px-2 py-0.5 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 mb-4 prose prose-slate prose-a:relative prose-a:z-10 dark:prose-dark line-clamp-2">
                                    {post.summary}
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

                            <Link href={`/${post._meta.path}`} className='flex items-center text-sm text-blue-400 font-medium'>
                                <span className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl"></span>
                                <span className="relative">
                                    Read more
                                    <span className="sr-only">, {post.summary}</span>
                                </span>
                                <svg className="relative mt-px overflow-visible ml-2.5 text-blue-400 dark:text-sky-700" width="3" height="6" viewBox="0 0 3 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M0 0L3 3L0 6"></path>
                                </svg>
                            </Link>

                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default BlogIndex;