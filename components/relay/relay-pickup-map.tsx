import React from 'react';
import { cn } from '@/lib/utils';
import type { RelayVoicingPickupMap, RelayPickupRole, RelayPickupSlot, RelayPickupType } from '@/types/relay-voicing';

export type RelayPickupMapProps = RelayVoicingPickupMap;

const typeLabel: Record<RelayPickupType, string> = {
    humbucker: 'Humbucker',
    lipstick: 'Lipstick',
    p90: 'P90-type',
    rail: 'Rail humbucker',
    filtertron: 'Filtertron',
};

const selectorLabel: Record<string, string> = {
    '3-way': '3-way toggle',
    '5-way': '5-way blade',
    'super-switch': 'Super Switch (4-pole)',
};

function PickupIcon({ type }: { type: RelayPickupType }) {
    if (type === 'humbucker') {
        return (
            <div className="flex items-center justify-center gap-1">
                <div className="h-12 w-4 rounded bg-slate-300 dark:bg-slate-600" />
                <div className="h-12 w-4 rounded bg-slate-300 dark:bg-slate-600" />
            </div>
        );
    }
    if (type === 'lipstick') {
        return (
            <div className="flex items-center justify-center">
                <div className="h-12 w-3 rounded-full bg-amber-300 dark:bg-amber-600" />
            </div>
        );
    }
    if (type === 'filtertron') {
        return (
            <div className="flex items-center justify-center gap-1">
                <svg viewBox="0 0 18 48" className="h-12 w-auto" fill="none">
                    <rect x="0.5" y="0.5" width="17" height="47" rx="3" className="fill-emerald-300 dark:fill-emerald-700" />
                    {[8, 16, 24, 32, 40].map((cy) => (
                        <rect key={cy} x="5" y={cy - 3} width="8" height="6" rx="1" className="fill-emerald-500 dark:fill-emerald-400" />
                    ))}
                </svg>
                <svg viewBox="0 0 18 48" className="h-12 w-auto" fill="none">
                    <rect x="0.5" y="0.5" width="17" height="47" rx="3" className="fill-emerald-300 dark:fill-emerald-700" />
                    {[8, 16, 24, 32, 40].map((cy) => (
                        <rect key={cy} x="5" y={cy - 3} width="8" height="6" rx="1" className="fill-emerald-500 dark:fill-emerald-400" />
                    ))}
                </svg>
            </div>
        );
    }
    if (type === 'p90') {
        return (
            <div className="flex items-center justify-center">
                <svg viewBox="0 0 28 64" className="h-12 w-auto" fill="none">
                    <rect x="0.5" y="0.5" width="27" height="63" rx="4" className="fill-violet-300 dark:fill-violet-700" />
                    {[8, 18, 28, 38, 48, 58].map((cy) => (
                        <circle key={cy} cx={14} cy={cy} r={3} className="fill-violet-500 dark:fill-violet-400" />
                    ))}
                </svg>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center gap-0.5">
            <div className="h-12 w-2 rounded bg-zinc-400 dark:bg-zinc-500" />
            <div className="h-12 w-2 rounded bg-zinc-400 dark:bg-zinc-500" />
        </div>
    );
}

function RoleBadge({ role }: { role?: RelayPickupRole }) {
    if (!role || role === 'core') return null;
    const roleStyles: Record<Exclude<RelayPickupRole, 'core'>, string> = {
        primary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
        shaper: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        augment: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
        subsystem: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-400',
        concept: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400',
    };
    const roleLabels: Record<Exclude<RelayPickupRole, 'core'>, string> = {
        primary: 'primary',
        shaper: 'shaper',
        augment: 'augment',
        subsystem: 'subsystem',
        concept: 'concept',
    };
    return (
        <span
            className={cn(
                'mt-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium',
                roleStyles[role],
            )}
        >
            {roleLabels[role]}
        </span>
    );
}

function PickupCard({ slot, position }: { slot: RelayPickupSlot; position: string }) {
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{position}</p>
            <PickupIcon type={slot.type} />
            <div className="flex flex-col items-center">
                <p className="text-sm font-medium leading-tight">{typeLabel[slot.type]}</p>
                {(slot.magnet || slot.resistance) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {[slot.magnet, slot.resistance].filter(Boolean).join(' · ')}
                    </p>
                )}
                <RoleBadge role={slot.role} />
            </div>
        </div>
    );
}

function ControlChip({ label, value }: { label: string; value: string }) {
    return (
        <span className="text-xs">
            <span className="font-medium text-foreground">{label}</span>
            <span className="ml-1 text-muted-foreground">{value}</span>
        </span>
    );
}

export function RelayPickupMap({ bridge, middle, neck, selector, volume = 'standard', tone = 'standard' }: RelayPickupMapProps) {
    return (
        <div className="my-6 overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-3 divide-x">
                {[
                    { slot: bridge, position: 'Bridge' },
                    { slot: middle, position: 'Middle' },
                    { slot: neck, position: 'Neck' },
                ].map(({ slot, position }) => (
                    <div key={position} className="px-4 py-6">
                        <PickupCard slot={slot} position={position} />
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t bg-muted/40 px-5 py-3">
                <ControlChip label="Selector" value={selectorLabel[selector]} />
                <ControlChip label="Volume" value={volume} />
                <ControlChip label="Tone" value={tone} />
            </div>
        </div>
    );
}
