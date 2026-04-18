import React from 'react';
import { cn } from '@/lib/utils';

type PickupType = 'humbucker' | 'lipstick' | 'p90' | 'rail';
type PickupRole = 'core' | 'alternate' | 'auxiliary';

interface PickupSlot {
    type: PickupType;
    model?: string;
    role?: PickupRole;
}

export interface RelayPickupMapProps {
    bridge: PickupSlot;
    middle: PickupSlot;
    neck: PickupSlot;
    selector: '3-way' | '5-way' | 'super-switch';
    volume?: 'standard' | 'push-push' | 'push-pull';
    tone?: 'standard' | 'push-pull' | 'push-push' | 'concentric';
}

const typeLabel: Record<PickupType, string> = {
    humbucker: 'Humbucker',
    lipstick: 'Lipstick',
    p90: 'P90-type',
    rail: 'Rail humbucker',
};

const selectorLabel: Record<string, string> = {
    '3-way': '3-way toggle',
    '5-way': '5-way blade',
    'super-switch': 'Super Switch (4-pole)',
};

function PickupIcon({ type }: { type: PickupType }) {
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
    if (type === 'p90') {
        return (
            <div className="flex items-center justify-center">
                <div className="h-10 w-10 rounded bg-violet-300 dark:bg-violet-700" />
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

function RoleBadge({ role }: { role?: PickupRole }) {
    if (!role || role === 'core') return null;
    return (
        <span
            className={cn(
                'mt-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium',
                role === 'alternate'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
            )}
        >
            {role === 'alternate' ? 'alt. layer' : 'aux. layer'}
        </span>
    );
}

function PickupCard({ slot, position }: { slot: PickupSlot; position: string }) {
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{position}</p>
            <PickupIcon type={slot.type} />
            <div className="flex flex-col items-center">
                <p className="text-sm font-medium leading-tight">{typeLabel[slot.type]}</p>
                {slot.model && <p className="mt-0.5 text-xs text-muted-foreground">{slot.model}</p>}
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
