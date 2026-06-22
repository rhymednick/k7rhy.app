import React from 'react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';

interface BlogPostNavProps {
    prev: { slug: string; title: string; date: string } | null;
    next: { slug: string; title: string; date: string } | null;
}

export function BlogPostNav({ prev, next }: BlogPostNavProps) {
    if (!prev && !next) return null;

    return (
        <nav className={cn('mt-8 grid gap-4', prev && next ? 'grid-cols-2' : 'grid-cols-1')}>
            {prev && (
                <Link
                    href={`/blog/${prev.slug}`}
                    className="rounded-xl border border-transparent bg-muted/50 p-4 transition-all duration-150 hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]"
                >
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">← Previous</div>
                    <div className="mt-1 font-semibold text-foreground">{prev.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(prev.date)}</div>
                </Link>
            )}
            {next && (
                <Link
                    href={`/blog/${next.slug}`}
                    className="rounded-xl border border-transparent bg-muted/50 p-4 text-right transition-all duration-150 hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]"
                >
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next →</div>
                    <div className="mt-1 font-semibold text-foreground">{next.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(next.date)}</div>
                </Link>
            )}
        </nav>
    );
}
