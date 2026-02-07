import React from 'react';
import { cn } from '@/lib/utils';

interface CTABannerProps {
    title: string;
    description: string;
    variant?: 'default' | 'gradient';
    children: React.ReactNode;
}

export function CTABanner({ title, description, variant = 'default', children }: CTABannerProps) {
    return (
        <div
            className={cn(
                'relative isolate overflow-hidden rounded-2xl px-6 py-10 text-center md:px-12',
                variant === 'default' && 'bg-muted/50',
                variant === 'gradient' && 'bg-gradient-to-br from-sky-100 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900'
            )}
        >
            {variant === 'gradient' && <div className="absolute -right-16 top-0 -z-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />}
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{description}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>
        </div>
    );
}
