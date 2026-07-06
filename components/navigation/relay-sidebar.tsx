'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayBuildProcess } from '@/config/relay-build-process';
import { relayVoicings } from '@/config/relay-voicings';
import type { RelayBreadcrumb } from '@/lib/relay';
import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';
import { MyBreadcrumbs } from '@/components/doc/doc-page';

const PLATFORM_HREF = '/relay';

function StageStatusTag({ status }: { status: RelayStageStatus }) {
    if (status === 'live') return null;
    const tone = status === 'in-progress' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400';
    const label = status === 'in-progress' ? 'In progress' : 'Planned';
    return <span className={cn('ml-2 shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide', tone)}>{label}</span>;
}

/** A build step is active when the path is the step href or nested under it. */
function isStageActive(stage: RelayBuildStage, pathname: string): boolean {
    return pathname === stage.href || pathname.startsWith(`${stage.href}/`);
}

function BuildStageRow({ stage, pathname }: { stage: RelayBuildStage; pathname: string }) {
    const active = isStageActive(stage, pathname);
    const showItems = active && stage.items && stage.items.length > 0;

    return (
        <li>
            <Link href={stage.href} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm font-medium hover:underline', active ? 'text-foreground' : 'text-foreground/70')}>
                <span className="flex-1">
                    <span aria-hidden="true" className="mr-1.5 text-muted-foreground">
                        {stage.number}
                    </span>
                    {stage.title}
                </span>
                <StageStatusTag status={stage.status} />
            </Link>
            {showItems && (
                <ul className="ml-4 mt-0.5 grid grid-flow-row auto-rows-max border-l border-border/50">
                    {stage.items!.map((item) => {
                        const isItemActive = pathname === item.href;
                        // The Voicing step's sub-items link to a specific voicing; show its full
                        // display name (e.g. "Relay Lipstick") rather than the short stage-item title.
                        const voicingEntry = stage.slug === 'voicings' ? relayVoicings.find((v) => v.href === item.href) : undefined;
                        const label = voicingEntry?.name ?? item.title;
                        return (
                            <li key={item.href}>
                                <Link href={item.href} className={cn('flex w-full items-center rounded-md border border-transparent py-1 pl-3 pr-2 text-sm hover:underline', isItemActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <Link href={PLATFORM_HREF} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline', pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    Overview
                </Link>
            </div>

            <div>
                <h4 className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Build process</h4>
                <ul className="grid grid-flow-row auto-rows-max">
                    {relayBuildProcess.stages.map((stage) => (
                        <BuildStageRow key={stage.slug} stage={stage} pathname={pathname} />
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
