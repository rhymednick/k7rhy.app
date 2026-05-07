'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import type { RelayBreadcrumb } from '@/lib/relay';
import { MyBreadcrumbs } from '@/components/doc/doc-page';
import { RelayVoicingLineupNav } from '@/components/relay/relay-voicing-lineup-nav';

const PLATFORM_HREF = '/relay';
const PLATFORM_LABEL = 'Relay Guitar';

// ─── Platform-level sidebar ───────────────────────────────────────────────────

function PlatformSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={PLATFORM_HREF}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        Platform Overview
                    </Link>
                </div>
            </div>

            <div className="pb-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Voicings</h4>
                <RelayVoicingLineupNav />
            </div>
        </nav>
    );
}

// ─── Voicing-level sidebar ────────────────────────────────────────────────────

function VoicingSidebar({ voicing }: { voicing: string }) {
    const pathname = usePathname();
    const voicingNav = relayNav[voicing];

    if (!voicingNav) return null;

    const voicingRootHref = `/relay/voicings/${voicing}`;
    const isVoicingRootActive = pathname === voicingRootHref;

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-3">
                <Link
                    href={PLATFORM_HREF}
                    className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                    ← {PLATFORM_LABEL}
                </Link>
            </div>

            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={voicingRootHref}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            isVoicingRootActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        {voicingNav.title}
                    </Link>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">All voicings</h4>
                <RelayVoicingLineupNav />
            </div>
        </nav>
    );
}

// ─── Auto-switching sidebar ───────────────────────────────────────────────────

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';
    const segments = pathname.split('/').filter(Boolean);
    const relayIndex = segments.indexOf('relay');
    const nextSegment = relayIndex >= 0 ? (segments[relayIndex + 1] ?? '') : '';
    const voicingSlug = nextSegment === 'voicings' ? (segments[relayIndex + 2] ?? '') : '';

    // Voicing-level sidebar only on /relay/voicings/<slug>; everything else uses the platform sidebar.
    if (!voicingSlug) {
        return <PlatformSidebar />;
    }

    return <VoicingSidebar voicing={voicingSlug} />;
}

// ─── Breadcrumb bar ───────────────────────────────────────────────────────────

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
