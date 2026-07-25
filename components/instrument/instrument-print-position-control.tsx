import React from 'react';
import { HARMONIC_SHAPER_POSITION_DESCRIPTIONS, HARMONIC_SHAPER_PURPOSE } from '@/config/harmonic-shaper';

export interface PrintPositionControlPositionProps {
    description?: string;
    technicalReference?: string;
    index?: number;
}

function printPositionChildren(children: React.ReactNode, parent: string): React.ReactElement<PrintPositionControlPositionProps>[] {
    const positions: React.ReactElement<PrintPositionControlPositionProps>[] = [];
    React.Children.forEach(children, (child) => {
        if (child === null || child === undefined || (typeof child === 'string' && child.trim() === '')) return;
        if (!React.isValidElement<PrintPositionControlPositionProps>(child) || child.type !== PrintPositionControlPosition) throw new Error(`${parent} contains an unsupported child`);
        positions.push(child);
    });
    if (positions.length !== 6) throw new Error(`${parent} requires exactly six positions but contains ${positions.length}`);
    return positions;
}

export function PrintPositionControl({ label, purpose, children }: { label: string; purpose: string; children: React.ReactNode }) {
    const positions = printPositionChildren(children, label);

    return (
        <section className="rounded-md border border-slate-300 bg-slate-50 p-1.5">
            <div className="mb-1 flex items-baseline justify-between gap-2">
                <h3 className="text-[8.5pt] font-semibold">{label}</h3>
                <span className="font-mono text-[7pt] uppercase tracking-wider text-slate-500">6-position selector</span>
            </div>
            <p className="mb-1.5 text-[7.3pt] leading-[1.2] text-slate-600">{purpose}</p>
            <ol className="grid grid-cols-2 gap-1">
                {positions.map((position, index) => React.cloneElement(position, { index: index + 1, key: `${label}-${index}` }))}
            </ol>
        </section>
    );
}

export function PrintPositionControlPosition({ description, technicalReference, index }: PrintPositionControlPositionProps) {
    if (!index) throw new Error('PrintPositionControlPosition must be rendered inside PrintPositionControl');
    if (!description?.trim()) throw new Error(`Print position ${index} requires description`);

    return (
        <li className="rounded border border-slate-300 bg-white p-1.5 text-[7.2pt] leading-[1.18]">
            <span aria-label={`Position ${index}`} className="mb-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 font-mono text-[7pt] font-bold text-white">
                {index}
            </span>
            <p className="text-slate-700">{description}</p>
            {technicalReference && <p className="mt-1 border-t border-slate-200 pt-1 font-mono text-[6.5pt] text-slate-500">{technicalReference}</p>}
        </li>
    );
}

export function PrintHarmonicShaper({ children }: { children: React.ReactNode }) {
    const positions = printPositionChildren(children, 'Harmonic Shaper');
    return (
        <PrintPositionControl label="Harmonic Shaper" purpose={HARMONIC_SHAPER_PURPOSE}>
            {positions.map((position, index) => React.cloneElement(position, { description: HARMONIC_SHAPER_POSITION_DESCRIPTIONS[index], key: `harmonic-shaper-${index}` }))}
        </PrintPositionControl>
    );
}

PrintPositionControl.displayName = 'PrintPositionControl';
PrintPositionControlPosition.displayName = 'PrintPositionControlPosition';
PrintHarmonicShaper.displayName = 'PrintHarmonicShaper';
