import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { relayBuildProcess } from '@/config/relay-build-process';

interface RelayHeroProps {
    title: string;
    tagline: string;
}

export function RelayHero({ title, tagline }: RelayHeroProps) {
    const bodyStage = relayBuildProcess.stages.find((s) => s.slug === 'body');
    const bodyHref = bodyStage?.href ?? '/relay';
    const bodyIsExternal = bodyStage?.isDiscord ?? false;

    return (
        <div className="my-8">
            <h1 className="font-heading scroll-m-20 text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{tagline}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/relay/voicings" className={cn('inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors', 'hover:bg-sky-700')}>
                    Choose your voicing →
                </Link>
                <Link
                    href={bodyHref}
                    {...(bodyIsExternal ? { target: '_blank', rel: 'noopener noreferrer' as const } : {})}
                    className={cn('inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors', 'hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400')}
                >
                    ↓ Download body files
                </Link>
            </div>

            <p className="mt-3 text-xs italic text-muted-foreground">Pick first, order parts, then start printing — they&rsquo;ll ship while the body prints.</p>
        </div>
    );
}
