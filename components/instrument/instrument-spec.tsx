import React from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

type SelectorCount = 3 | 5;
type PotMechanism = 'standard' | 'push-pull' | 'push-push';
type PotState = 'normal' | 'down' | 'up';

export interface SelectorPositionProps {
    voice: string;
    children: React.ReactNode;
    index?: number;
}

export interface PotPositionProps {
    position: PotState;
    voice: string;
    children: React.ReactNode;
}

export interface PickupProps {
    position: string;
    type: string;
    brand: string;
    model: string;
    children?: React.ReactNode;
}

function isEmptyChild(child: React.ReactNode): boolean {
    return child === null || child === undefined || (typeof child === 'string' && child.trim() === '');
}

function elementChildren<P>(children: React.ReactNode, type: React.ComponentType<P>, parent: string): React.ReactElement<P>[] {
    const result: React.ReactElement<P>[] = [];

    React.Children.forEach(children, (child) => {
        if (isEmptyChild(child)) return;
        if (!React.isValidElement<P>(child) || child.type !== type) {
            throw new Error(`${parent} contains an unsupported child`);
        }
        result.push(child);
    });

    return result;
}

function requireText(value: string, field: string, parent: string) {
    if (value.trim().length === 0) {
        throw new Error(`${parent} requires ${field}`);
    }
}

export function InstrumentSpec({ children }: { children: React.ReactNode }) {
    const pickups: React.ReactElement[] = [];
    const controls: React.ReactElement[] = [];

    React.Children.forEach(children, (child) => {
        if (isEmptyChild(child)) return;
        if (!React.isValidElement(child)) throw new Error('InstrumentSpec contains an unsupported child');
        if (child.type === PickupConfiguration) pickups.push(child);
        else if (child.type === ControlLayout) controls.push(child);
        else throw new Error('InstrumentSpec contains an unsupported child');
    });

    if (pickups.length !== 1 || controls.length !== 1) {
        throw new Error('InstrumentSpec requires exactly one PickupConfiguration and one ControlLayout');
    }

    return (
        <section data-instrument-spec className="space-y-6">
            {controls[0]}
            {pickups[0]}
        </section>
    );
}

export function PickupConfiguration({ children }: { children: React.ReactNode }) {
    const pickups = elementChildren(children, Pickup, 'PickupConfiguration');
    if (pickups.length === 0) throw new Error('PickupConfiguration requires at least one Pickup');

    return (
        <section data-pickup-configuration className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Magnetic voice</p>
                    <h2 className="text-xl font-semibold tracking-tight">Pickup configuration</h2>
                </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">{pickups}</div>
        </section>
    );
}

export function Pickup({ position, type, brand, model, children }: PickupProps) {
    requireText(position, 'position', 'Pickup');
    requireText(type, 'type', `Pickup ${position}`);
    requireText(brand, 'brand', `Pickup ${position}`);
    requireText(model, 'model', `Pickup ${position}`);
    const details = elementChildren(children, PickupDetail, `Pickup ${position}`);

    return (
        <article className="rounded-xl border border-border/60 bg-muted/25 p-4">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{position}</p>
            <h3 className="mt-1 text-base font-semibold">{brand} {model}</h3>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{type.replaceAll('-', ' ')}</p>
            {details.length > 0 && <dl className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm">{details}</dl>}
        </article>
    );
}

export function PickupDetail({ label, children }: { label: string; children: React.ReactNode }) {
    requireText(label, 'label', 'PickupDetail');
    return (
        <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    );
}

export function ControlLayout({ children }: { children: React.ReactNode }) {
    const controls: React.ReactElement[] = [];

    React.Children.forEach(children, (child) => {
        if (isEmptyChild(child)) return;
        if (!React.isValidElement(child) || (child.type !== Selector && child.type !== Pot)) {
            throw new Error('ControlLayout contains an unsupported child');
        }
        controls.push(child);
    });

    if (controls.length === 0) throw new Error('ControlLayout requires at least one Selector or Pot');

    return (
        <section data-control-layout className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                    <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Find its voices</p>
                    <h2 className="text-xl font-semibold tracking-tight">Voice and control map</h2>
                </div>
            </div>
            <div className="space-y-4">{controls}</div>
        </section>
    );
}

export function Selector({ label, positions, children }: { label: string; positions: SelectorCount; children: React.ReactNode }) {
    requireText(label, 'label', 'Selector');
    const items = elementChildren(children, SelectorPosition, label);
    if (items.length !== positions) {
        throw new Error(`${label} declares ${positions} positions but contains ${items.length}`);
    }

    return (
        <article className="rounded-xl border border-border/60 p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{label}</h3>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{positions}-way selector</span>
            </div>
            <ol className={positions === 5 ? 'grid gap-2 sm:grid-cols-5' : 'grid gap-2 sm:grid-cols-3'}>{items.map((item, index) => React.cloneElement(item, { index: index + 1, key: `${label}-${index}` } as SelectorPositionProps & React.Attributes))}</ol>
        </article>
    );
}

export function SelectorPosition({ voice, children, index }: SelectorPositionProps) {
    requireText(voice, 'voice', 'SelectorPosition');
    if (!index) throw new Error('SelectorPosition must be rendered inside Selector');

    return (
        <li className="rounded-lg border border-border/60 bg-muted/25 p-3">
            <div className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">{index}</div>
            <p className="text-sm font-semibold">{voice}</p>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </li>
    );
}

export function Pot({ label, mechanism, children }: { label: string; mechanism: PotMechanism; children: React.ReactNode }) {
    requireText(label, 'label', 'Pot');
    const items = elementChildren(children, PotPosition, label);
    const states = items.map((item) => item.props.position);
    const valid = mechanism === 'standard' ? states.length === 1 && states[0] === 'normal' : states.length === 2 && states.filter((state) => state === 'down').length === 1 && states.filter((state) => state === 'up').length === 1;

    if (!valid) {
        throw new Error(mechanism === 'standard' ? `${label} standard requires exactly one normal position` : `${label} ${mechanism} requires exactly one down and one up position`);
    }

    return (
        <article className="rounded-xl border border-border/60 p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{label}</h3>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{mechanism.replace('-', ' ')}</span>
            </div>
            <div className={items.length === 1 ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-2'}>{items}</div>
        </article>
    );
}

export function PotPosition({ position, voice, children }: PotPositionProps) {
    requireText(voice, 'voice', `PotPosition ${position}`);
    return (
        <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">{position}</p>
            <p className="mt-1 text-sm font-semibold">{voice}</p>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </div>
    );
}

InstrumentSpec.displayName = 'InstrumentSpec';
PickupConfiguration.displayName = 'PickupConfiguration';
Pickup.displayName = 'Pickup';
PickupDetail.displayName = 'PickupDetail';
ControlLayout.displayName = 'ControlLayout';
Selector.displayName = 'Selector';
SelectorPosition.displayName = 'SelectorPosition';
Pot.displayName = 'Pot';
PotPosition.displayName = 'PotPosition';
