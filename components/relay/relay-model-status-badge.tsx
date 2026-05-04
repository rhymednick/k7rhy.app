import React from 'react';
import { cn } from '@/lib/utils';
import type { RelayModelStatus } from '@/types/relay-model';

export type { RelayModelStatus };

export function RelayModelStatusBadge({ status, className }: { status: RelayModelStatus; className?: string }) {
    if (status === 'ready') {
        return <span className={cn('shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400', className)}>Ready</span>;
    }
    if (status === 'concept') {
        return <span className={cn('shrink-0 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400', className)}>Concept</span>;
    }
    return <span className={cn('shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400', className)}>Lab</span>;
}
