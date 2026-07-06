'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayVoicings } from '@/config/relay-voicings';
import { RelayVoicingStatusBadge } from '@/components/relay/relay-voicing-status-badge';
import type { RelayVoicingStatus } from '@/types/relay-voicing';

/** Identify the active voicing slug from a path like /relay/voicings/lipstick. Returns undefined for /relay or platform routes. */
function activeVoicingSlugFromPath(pathname: string): string | undefined {
    const parts = pathname.split('/').filter(Boolean);
    const relayIdx = parts.indexOf('relay');
    if (relayIdx < 0) return undefined;
    if (parts[relayIdx + 1] !== 'voicings') return undefined;
    const slug = parts[relayIdx + 2];
    return slug && relayVoicings.some((voicing) => voicing.slug === slug) ? slug : undefined;
}

const statusSortOrder: Record<RelayVoicingStatus, number> = {
    ready: 0,
    lab: 1,
    concept: 2,
};

export function sortRelayVoicings<T extends { name: string; status: RelayVoicingStatus }>(voicings: T[]): T[] {
    return [...voicings].sort((a, b) => {
        const statusDelta = statusSortOrder[a.status] - statusSortOrder[b.status];
        if (statusDelta !== 0) return statusDelta;
        return a.name.localeCompare(b.name);
    });
}

export function RelayVoicingLineupNav() {
    const pathname = usePathname() ?? '';
    const activeSlug = activeVoicingSlugFromPath(pathname);
    const voicings = sortRelayVoicings(relayVoicings);

    return (
        <div className="grid grid-flow-row auto-rows-max text-sm">
            {voicings.map((voicing) => {
                const href = `/relay/voicings/${voicing.slug}`;
                const isActive = activeSlug === voicing.slug;
                return (
                    <Link key={voicing.slug} href={href} className={cn('flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1 hover:underline', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                        <span className="min-w-0">{voicing.name}</span>
                        <RelayVoicingStatusBadge status={voicing.status} />
                    </Link>
                );
            })}
        </div>
    );
}
