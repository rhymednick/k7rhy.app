import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ModelStatus = 'available' | 'planned';

interface RelayModelCardProps {
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: ModelStatus;
    href?: string;
    rank?: 1 | 2 | 3;
    percentage?: number;
    onSelect?: () => void;
}

function StatusBadge({ status }: { status: ModelStatus }) {
    if (status === 'available') {
        return (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Available
            </span>
        );
    }
    return (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Planned
        </span>
    );
}

const RANK_BADGE_STYLES: Record<1 | 2 | 3, string> = {
    1: 'bg-indigo-500 text-white',
    2: 'bg-slate-600 text-slate-200',
    3: 'bg-slate-700 text-slate-400',
};

const RANK_BORDER_STYLES: Record<1 | 2 | 3, string> = {
    1: 'border-indigo-500 shadow-[0_0_0_1px_theme(colors.indigo.500)]',
    2: 'border-slate-600',
    3: 'border-slate-700',
};

const RANK_BAR_STYLES: Record<1 | 2 | 3, string> = {
    1: 'bg-indigo-500',
    2: 'bg-slate-600',
    3: 'bg-slate-700',
};

const RANK_PCT_LABEL_STYLES: Record<1 | 2 | 3, string> = {
    1: 'text-indigo-400',
    2: 'text-slate-500',
    3: 'text-slate-600',
};

export function RelayModelCard({ name, tagline, genres, description, status, href, rank, percentage, onSelect }: RelayModelCardProps) {
    const inner = (
        <div
            className={cn(
                'flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all',
                href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]',
                onSelect && 'cursor-pointer hover:border-slate-600',
                rank && RANK_BORDER_STYLES[rank],
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <h3
                    className={cn(
                        'font-semibold text-foreground',
                        href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400',
                    )}
                >
                    {name}
                </h3>
                <div className="flex shrink-0 items-center gap-2">
                    {rank && (
                        <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', RANK_BADGE_STYLES[rank])}>
                            {rank}
                        </span>
                    )}
                    <StatusBadge status={status} />
                </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tagline}</p>
            <p className="flex-1 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/70">{genres}</p>
            {percentage !== undefined && (
                <div className="mt-1">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                        <div
                            className={cn('h-full rounded-full transition-all duration-500', rank ? RANK_BAR_STYLES[rank] : 'bg-slate-600')}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className={cn('mt-1 text-xs font-semibold', rank ? RANK_PCT_LABEL_STYLES[rank] : 'text-muted-foreground')}>
                        {rank ? `Your #${rank} · ` : ''}{Math.round(percentage)}%
                    </p>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block">
                {inner}
            </Link>
        );
    }

    if (onSelect) {
        return (
            <button type="button" onClick={onSelect} className="block w-full text-left">
                {inner}
            </button>
        );
    }

    return <div>{inner}</div>;
}

interface RelayModelGridProps {
    children: React.ReactNode;
}

export function RelayModelGrid({ children }: RelayModelGridProps) {
    return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
