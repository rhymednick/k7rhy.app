import React from 'react';
import { HARMONIC_SHAPER_POSITION_DESCRIPTIONS, HARMONIC_SHAPER_PURPOSE } from '@/config/harmonic-shaper';

export interface PositionControlPositionProps {
    description?: string;
    technicalReference?: string;
    index?: number;
}

function requireText(value: string | undefined, field: string, parent: string) {
    if (!value?.trim()) throw new Error(`${parent} requires ${field}`);
}

function positionChildren(children: React.ReactNode, parent: string): React.ReactElement<PositionControlPositionProps>[] {
    const positions: React.ReactElement<PositionControlPositionProps>[] = [];

    React.Children.forEach(children, (child) => {
        if (child === null || child === undefined || (typeof child === 'string' && child.trim() === '')) return;
        if (!React.isValidElement<PositionControlPositionProps>(child) || child.type !== PositionControlPosition) throw new Error(`${parent} contains an unsupported child`);
        positions.push(child);
    });

    if (positions.length !== 6) throw new Error(`${parent} requires exactly six positions but contains ${positions.length}`);
    return positions;
}

export function PositionControl({ label, purpose, children }: { label: string; purpose: string; children: React.ReactNode }) {
    requireText(label, 'label', 'PositionControl');
    requireText(purpose, 'purpose', label);
    const positions = positionChildren(children, label);
    positions.forEach((position) => requireText(position.props.description, 'description', label));

    return (
        <article className="rounded-xl border border-border/60 p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{label}</h3>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">6-position selector</span>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{purpose}</p>
            <ol className="grid gap-2 md:grid-cols-2">
                {positions.map((position, index) => React.cloneElement(position, { index: index + 1, key: `${label}-${index}` }))}
            </ol>
        </article>
    );
}

export function PositionControlPosition({ description, technicalReference, index }: PositionControlPositionProps) {
    if (!index) throw new Error('PositionControlPosition must be rendered inside PositionControl');
    requireText(description, 'description', `Position ${index}`);

    return (
        <li className="rounded-lg border border-border/60 bg-muted/25 p-3">
            <div aria-label={`Position ${index}`} className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                {index}
            </div>
            <p className="text-sm leading-relaxed">{description}</p>
            {technicalReference && <p className="mt-2 border-t border-border/60 pt-2 font-mono text-xs text-muted-foreground">{technicalReference}</p>}
        </li>
    );
}

export function HarmonicShaper({ children }: { children: React.ReactNode }) {
    const positions = positionChildren(children, 'Harmonic Shaper');

    return (
        <PositionControl label="Harmonic Shaper" purpose={HARMONIC_SHAPER_PURPOSE}>
            {positions.map((position, index) => React.cloneElement(position, { description: HARMONIC_SHAPER_POSITION_DESCRIPTIONS[index], key: `harmonic-shaper-${index}` }))}
        </PositionControl>
    );
}

PositionControl.displayName = 'PositionControl';
PositionControlPosition.displayName = 'PositionControlPosition';
HarmonicShaper.displayName = 'HarmonicShaper';
