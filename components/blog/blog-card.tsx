import { Blog } from '@/.content-collections/generated';
import Link from 'next/link';
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface BlogCardProps {
    post: Blog;
}

export function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <Link href={`/blog/${post._meta.path}`} className="group relative block">
            <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all group-hover:shadow-md group-hover:scale-[1.02]">
                {post.publish === false && <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]"><span className="text-3xl font-bold text-destructive/40">Unpublished</span></div>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={new Date(post.date).toISOString()}>{formattedDate}</time>
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min read
                    </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">{post.title}</h3>
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.isAISummary && <span className="rounded-full border border-sky-500/30 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">AI Summary</span>}
                        {post.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
                {post.summary && <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.summary}</p>}
            </article>
        </Link>
    );
}
