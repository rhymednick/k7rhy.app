import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RelayVoicingTab {
    slug: string;
    name: string;
    genres?: string;
}

function getVoicingTabLabel(name: string): string {
    return name.replace(/^Relay\s+/, '');
}

/** A horizontal tab bar of voicing links. The page resolves the active voicing server-side and renders that voicing's content below this bar; each tab is a `?voicing=` link that swaps the content via RSC navigation without scrolling. */
export function RelayVoicingTabs({ voicings, activeSlug, basePath }: { voicings: RelayVoicingTab[]; activeSlug: string; basePath: string }) {
    const showScrollCue = voicings.some((voicing) => voicing.genres);

    return (
        <div className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground mt-3">Select your voice</p>
            </div>
            <div className="relative">
                <div role="tablist" aria-label="Select a Relay voice" className={cn('flex flex-nowrap gap-1 overflow-x-auto border-b', showScrollCue && 'pr-20')}>
                    {voicings.map((voicing) => {
                        const isActive = voicing.slug === activeSlug;
                        const label = getVoicingTabLabel(voicing.name);
                        return (
                            <Link key={voicing.slug} href={`${basePath}?voicing=${voicing.slug}`} scroll={false} role="tab" aria-label={voicing.name} aria-current={isActive ? 'page' : undefined} aria-selected={isActive} className={cn('-mb-px flex shrink-0 flex-col items-start gap-0.5 rounded-t-md border px-3 py-2 transition-colors', isActive ? 'border-sky-500 border-b-background bg-background text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-sky-300 hover:bg-background hover:text-foreground')}>
                                <span className="text-sm font-semibold">{label}</span>
                                {voicing.genres && (
                                    <span aria-hidden="true" className="whitespace-nowrap text-xs font-normal text-muted-foreground">
                                        {voicing.genres}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
                {showScrollCue && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 bg-gradient-to-l from-background via-background/95 to-transparent pl-8 pr-1 text-[11px] font-semibold uppercase text-muted-foreground">
                        <span>Scroll</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                )}
            </div>
        </div>
    );
}
