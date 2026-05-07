'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import { relayBuildProcess } from '@/config/relay-build-process';
import type { RelayBreadcrumb } from '@/lib/relay';
import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';
import { MyBreadcrumbs } from '@/components/doc/doc-page';
import { RelayVoicingLineupNav } from '@/components/relay/relay-voicing-lineup-nav';

const PLATFORM_HREF = '/relay';
const PLATFORM_LABEL = 'Relay Guitar';

function StageStatusTag({ status }: { status: RelayStageStatus }) {
    if (status === 'live') return null;
    const tone = status === 'in-progress' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400';
    return <span className={cn('ml-2 shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide', tone)}>Discord</span>;
}

function BuildStageRow({ stage, pathname }: { stage: RelayBuildStage; pathname: string }) {
    const linkProps = stage.isDiscord ? { target: '_blank' as const, rel: 'noopener noreferrer' as const } : {};
    const isActive = !stage.isDiscord && pathname === stage.href;

    return (
        <li>
            <Link href={stage.href} {...linkProps} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                <span className="mr-2 inline-block w-4 shrink-0 text-xs text-muted-foreground/70">{stage.number}.</span>
                <span className="flex-1">{stage.title}</span>
                <StageStatusTag status={stage.status} />
            </Link>
        </li>
    );
}

function PlatformSidebar() {
    const pathname = usePathname() ?? '';

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <Link href={PLATFORM_HREF} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline', pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    Platform Overview
                </Link>
            </div>

            <div className="pb-4">
                <h4 className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Build process</h4>
                <ul className="grid grid-flow-row auto-rows-max">
                    {relayBuildProcess.stages.map((stage) => (
                        <BuildStageRow key={stage.slug} stage={stage} pathname={pathname} />
                    ))}
                </ul>
            </div>

            <div className="border-t pt-4">
                <h4 className="mb-1 px-2 py-1 text-sm font-semibold">Voicings</h4>
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
                <Link href={PLATFORM_HREF} className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    ← {PLATFORM_LABEL}
                </Link>
            </div>

            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link href={voicingRootHref} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline', isVoicingRootActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
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

    // Voicing-level sidebar only on /relay/voicings/<slug> (a specific voicing — not the gallery).
    // Everything else (including /relay/voicings, /relay/body, /relay/assembly) uses the platform sidebar.
    if (!voicingSlug) {
        return <PlatformSidebar />;
    }

    return <VoicingSidebar voicing={voicingSlug} />;
}

// ─── Breadcrumb bar ───────────────────────────────────────────────────────────

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
