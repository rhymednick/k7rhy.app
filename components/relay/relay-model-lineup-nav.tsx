'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import { RelayModelStatusBadge } from '@/components/relay/relay-model-status-badge';

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

export function RelayModelLineupNav() {
    const pathname = usePathname() ?? '';
    const activeKey = activeModelKeyFromPath(pathname);
    const entries = Object.entries(relayNav);

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
