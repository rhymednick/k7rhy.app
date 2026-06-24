import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { instrumentDateLabel } from '@/lib/instruments/date';
import { instrumentUrl } from '@/lib/instruments/serial';
import type { InstrumentRecord } from '@/types/instrument';

export function InstrumentCaseCard({ record, children }: { record: InstrumentRecord; children: React.ReactNode }) {
    const url = instrumentUrl(record.serial);
    const dateLabel = instrumentDateLabel(record.dateLabel);

    return (
        <article className="instrument-case-card flex flex-col border border-slate-300 bg-white p-[0.26in] text-slate-950 shadow-xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-300 pb-3">
                <div className="flex items-center gap-3">
                    <Image src="/images/k7rhy_logo.png" alt="K7RHY Resonance Lab logo" width={42} height={42} className="h-10 w-10 object-contain" />
                    <div>
                        <p className="text-base font-bold tracking-tight">K7RHY Resonance Lab</p>
                        <p className="font-mono text-[7.5pt] uppercase tracking-[0.16em] text-slate-500">Crafted instrument record</p>
                    </div>
                </div>
                <span className="text-right font-mono text-[8pt] font-semibold uppercase tracking-[0.16em] text-slate-500">Voice &amp;<br />control card</span>
            </header>

            <section className="relative overflow-hidden py-4">
                <div className="pointer-events-none absolute -right-16 -top-28 h-52 w-52 rounded-full border border-sky-200 shadow-[0_0_0_18px_#f0f9ff,0_0_0_36px_#f8fafc]" />
                <div className="relative">
                    <div className="font-mono text-[8.5pt] font-semibold tracking-[0.14em] text-sky-700">{record.serial} · {dateLabel.toUpperCase()} {record.year}</div>
                    <h1 className="mt-1 text-[23pt] font-semibold leading-none tracking-tight">{record.name}</h1>
                    <p className="mt-2 max-w-[6.3in] text-[9pt] leading-relaxed text-slate-600">{record.theme}</p>
                </div>
            </section>

            <section className="instrument-case-card-spec min-h-0 flex-1">{children}</section>

            <section className="mt-3 grid grid-cols-[0.85in_1fr] gap-3 border-t border-slate-300 pt-2 text-[8.5pt] leading-relaxed">
                <span className="font-mono text-[7.5pt] font-semibold uppercase tracking-wider text-slate-500">Origin</span>
                <span>{record.origin}</span>
            </section>

            <footer className="mt-3 flex items-end justify-between gap-4 border-t border-slate-300 pt-3">
                <div className="space-y-2 text-slate-600">
                    <p className="font-mono text-[7.5pt] tracking-wide">{url}</p>
                    <a href={siteConfig.links.discord} className="inline-flex items-center gap-1.5 text-[8.5pt] font-semibold text-slate-800 underline decoration-sky-500 underline-offset-2">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Questions? Join the K7RHY Discord
                    </a>
                </div>
                <div className="rounded-md border border-slate-300 bg-white p-1.5">
                    <QRCodeSVG value={url} size={72} level="M" marginSize={1} title={`Open the record for ${record.serial}`} />
                </div>
            </footer>
        </article>
    );
}
