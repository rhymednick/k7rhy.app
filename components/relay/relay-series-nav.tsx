import React from 'react';
import Link from 'next/link';

interface SeriesLink {
    title: string;
    href: string;
}

/** Previous and next links at the bottom of a page in a series. Renders nothing when neither exists. */
export function RelaySeriesNav({ prev, next }: { prev?: SeriesLink; next?: SeriesLink }) {
    if (!prev && !next) return null;
    return (
        <nav aria-label="Series navigation" className="mt-10 flex flex-wrap items-stretch justify-between gap-4 border-t pt-6">
            {prev ? (
                <Link href={prev.href} className="flex-1 rounded-md border px-4 py-3 text-sm hover:bg-muted/50">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Previous</span>
                    <span className="font-medium">{prev.title}</span>
                </Link>
            ) : (
                <span className="hidden flex-1 sm:block" aria-hidden="true" />
            )}
            {next ? (
                <Link href={next.href} className="flex-1 rounded-md border px-4 py-3 text-right text-sm hover:bg-muted/50">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">Next</span>
                    <span className="font-medium">{next.title}</span>
                </Link>
            ) : (
                <span className="hidden flex-1 sm:block" aria-hidden="true" />
            )}
        </nav>
    );
}
