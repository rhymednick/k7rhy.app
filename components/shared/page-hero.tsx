import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PageHeroProps {
    badge?: string;
    title: string;
    description: string | React.ReactNode;
    secondaryText?: string | React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export function PageHero({ badge, title, description, secondaryText, actions, children, footer }: PageHeroProps) {
    return (
        <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-white/80 px-6 py-12 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-white/10 md:px-12">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-white to-emerald-100 opacity-90 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900" />
            <div className="absolute -right-24 top-10 -z-10 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-500/10" />
            <div className="absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
            <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-6">
                    {badge && <Badge className="w-fit border border-slate-300/70 bg-white/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">{badge}</Badge>}
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">{title}</h1>
                    <div className="text-lg text-slate-700 dark:text-slate-300">{description}</div>
                    {secondaryText && <div className="text-base text-slate-600 dark:text-slate-400">{secondaryText}</div>}
                    {actions && <div className="flex w-full flex-wrap gap-3">{actions}</div>}
                    {footer}
                </div>
                {children}
            </div>
        </section>
    );
}
