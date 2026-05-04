'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import { RelayModelStatusBadge } from '@/components/relay/relay-model-status-badge';
import type { RelayModelStatus } from '@/types/relay-model';
import type { RelayModelNav } from '@/types/relay-nav';

// Segments under /relay/ that are platform routes, not model keys.
// Expand this list as build guide phases ship (e.g. 'build').
const PLATFORM_ROUTE_SEGMENTS = new Set(['build']);

function activeModelKeyFromPath(pathname: string): string | undefined {
    const parts = pathname.split('/').filter(Boolean);
    const relayIdx = parts.indexOf('relay');
    const next = relayIdx >= 0 ? parts[relayIdx + 1] : undefined;
    if (!next || PLATFORM_ROUTE_SEGMENTS.has(next)) return undefined;
    return relayNav[next] ? next : undefined;
}

const statusSortOrder: Record<RelayModelStatus, number> = {
    ready: 0,
    lab: 1,
    concept: 2,
};

export function sortRelayModelNavEntries(entries: Array<[string, RelayModelNav]>): Array<[string, RelayModelNav]> {
    return [...entries].sort(([, a], [, b]) => {
        const statusDelta = statusSortOrder[a.status] - statusSortOrder[b.status];
        if (statusDelta !== 0) return statusDelta;
        return a.title.localeCompare(b.title);
    });
}

export function RelayModelLineupNav() {
    const pathname = usePathname() ?? '';
    const activeKey = activeModelKeyFromPath(pathname);
    const entries = sortRelayModelNavEntries(Object.entries(relayNav));

    return (
        <div className="grid grid-flow-row auto-rows-max text-sm">
            {entries.map(([key, model]) => {
                const href = `/relay/${key}`;
                const isActive = activeKey === key;
                return (
                    <Link key={key} href={href} className={cn('flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1 hover:underline', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                        <span className="min-w-0">{model.title}</span>
                        <RelayModelStatusBadge status={model.status} />
                    </Link>
                );
            })}
        </div>
    );
}
