import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { relayBuildProcess } from '@/config/relay-build-process';
import type { RelayBuildStage, RelayStageStatus } from '@/types/relay-nav';

function StageStatusBadge({ status }: { status: RelayStageStatus }) {
    if (status === 'live') {
        return <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>;
    }
    if (status === 'in-progress') {
        return <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">In progress</span>;
    }
    return <span className="shrink-0 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">Planned</span>;
}

function RelayProcessCard({ stage }: { stage: RelayBuildStage }) {
    const linkProps = stage.isDiscord ? { target: '_blank', rel: 'noopener noreferrer' as const } : {};

    const ctaLabel = stage.status === 'live' ? `Open ${stage.title.toLowerCase()} guide →` : stage.status === 'in-progress' ? 'Follow progress →' : 'Coming soon →';

    return (
        <Link href={stage.href} {...linkProps} className="group block h-full">
            <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]')}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">{stage.number}</span>
                        <h3 className="font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">{stage.title}</h3>
                    </div>
                    <StageStatusBadge status={stage.status} />
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{stage.summary}</p>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400">{ctaLabel}</p>
            </div>
        </Link>
    );
}

export function RelayProcessOverview() {
    return (
        <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {relayBuildProcess.stages.map((stage) => (
                <RelayProcessCard key={stage.slug} stage={stage} />
            ))}
        </div>
    );
}
