import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface RelayVoicingTab {
	slug: string;
	name: string;
}

/** A horizontal tab bar of voicing links. The page resolves the active voicing server-side and renders that voicing's content below this bar; each tab is a `?voicing=` link that swaps the content via RSC navigation without scrolling. */
export function RelayVoicingTabs({ voicings, activeSlug, basePath }: { voicings: RelayVoicingTab[]; activeSlug: string; basePath: string }) {
	return (
		<div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b">
			{voicings.map((voicing) => {
				const isActive = voicing.slug === activeSlug;
				return (
					<Link
						key={voicing.slug}
						href={`${basePath}?voicing=${voicing.slug}`}
						scroll={false}
						role="tab"
						aria-current={isActive ? 'page' : undefined}
						aria-selected={isActive}
						className={cn(
							'-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
							isActive ? 'border-sky-500 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
						)}
					>
						{voicing.name}
					</Link>
				);
			})}
		</div>
	);
}
