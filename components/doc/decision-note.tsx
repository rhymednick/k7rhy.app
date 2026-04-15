'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DecisionNoteProps {
    title: string;
    children: React.ReactNode;
    variant?: 'caution' | 'info' | 'choice';
}

const variantStyles = {
    caution: {
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/5',
        label: 'text-amber-500',
        icon: '⚠',
    },
    info: {
        border: 'border-blue-500/40',
        bg: 'bg-blue-500/5',
        label: 'text-blue-400',
        icon: 'ℹ',
    },
    choice: {
        border: 'border-violet-500/40',
        bg: 'bg-violet-500/5',
        label: 'text-violet-400',
        icon: '◆',
    },
};

export function DecisionNote({ title, children, variant = 'choice' }: DecisionNoteProps) {
    const [open, setOpen] = React.useState(false);
    const styles = variantStyles[variant];

    return (
        <div className={cn('my-4 rounded-lg border', styles.border, styles.bg)}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <span className={cn('text-sm font-bold', styles.label)}>{styles.icon}</span>
                <span className="flex-1 text-sm font-semibold">{title}</span>
                <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
                />
            </button>
            {open && (
                <div className="border-t border-inherit px-4 py-3 text-sm text-muted-foreground [&>p]:mt-2 [&>p:first-child]:mt-0">
                    {children}
                </div>
            )}
        </div>
    );
}
