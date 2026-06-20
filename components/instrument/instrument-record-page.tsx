import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileText, Guitar, Printer } from 'lucide-react';
import type { InstrumentRecord } from '@/types/instrument';

export interface InstrumentRecordPageProps {
    record: InstrumentRecord;
    children: React.ReactNode;
}

function formatCompletedDate(completed: string) {
    return new Date(`${completed}T00:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

export function InstrumentRecordPage({ record, children }: InstrumentRecordPageProps) {
    const primaryImage = record.images[0];

    return (
        <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-12">
            <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:ring-white/10">
                <div className="absolute -left-20 bottom-0 -z-10 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10" />
                <div className="absolute -right-20 top-0 -z-10 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="flex flex-col justify-center space-y-5 p-7 md:p-10 lg:p-12">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
                                <Guitar className="h-3.5 w-3.5" aria-hidden="true" />
                                Individual instrument
                            </span>
                            <span className="font-mono text-sm font-semibold tracking-[0.16em] text-sky-700 dark:text-sky-300">{record.serial}</span>
                        </div>
                        <div>
                            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{record.modelDescription} · completed {record.year}</p>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">{record.name}</h1>
                        </div>
                        <p className="max-w-2xl text-lg leading-relaxed text-slate-700 dark:text-slate-300">{record.theme}</p>
                        <dl className="grid gap-4 border-t border-slate-300/70 pt-5 text-sm dark:border-slate-700/70 sm:grid-cols-2">
                            <div>
                                <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Origin</dt>
                                <dd className="mt-1 leading-relaxed text-slate-800 dark:text-slate-200">{record.origin}</dd>
                            </div>
                            <div>
                                <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</dt>
                                <dd className="mt-1 text-slate-800 dark:text-slate-200">{formatCompletedDate(record.completed)}</dd>
                            </div>
                        </dl>
                        <div>
                            <Link href={`/sn/${record.serial}/print`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                                <Printer className="h-4 w-4" aria-hidden="true" />
                                Print case card
                            </Link>
                        </div>
                    </div>
                    <div className="relative min-h-80 overflow-hidden border-t border-border/60 bg-slate-100 dark:bg-slate-900 lg:min-h-[36rem] lg:border-l lg:border-t-0">
                        <Image src={primaryImage.src} alt={primaryImage.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 42vw, 100vw" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" />
                        <div className="absolute bottom-4 right-4 rounded-md border border-white/30 bg-slate-950/60 px-3 py-1.5 font-mono text-xs tracking-[0.14em] text-white backdrop-blur">{record.serial}</div>
                    </div>
                </div>
            </section>

            <article className="space-y-8" aria-label={`${record.name} instrument details`}>
                {children}
            </article>

            {record.related && (
                <aside className="flex flex-col gap-5 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-6 dark:border-sky-900/70 dark:from-sky-950/30 dark:to-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-sky-200 bg-white text-sky-700 shadow-sm dark:border-sky-900 dark:bg-slate-950 dark:text-sky-300">
                            <FileText className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="font-semibold">Continue exploring</h2>
                            <p className="mt-1 text-sm text-muted-foreground">See how this instrument fits into the wider K7RHY work.</p>
                        </div>
                    </div>
                    <Link href={record.related.href} className="inline-flex items-center gap-2 font-semibold text-sky-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300">
                        {record.related.label}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </aside>
            )}
        </main>
    );
}
