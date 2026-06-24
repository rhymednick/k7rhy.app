import React from 'react';

type SelectorCount = 3 | 5;
type PotMechanism = 'standard' | 'push-pull' | 'push-push';
type PotState = 'normal' | 'down' | 'up';

interface SelectorPositionProps {
    voice: string;
    children: React.ReactNode;
    index?: number;
}

interface PotPositionProps {
    position: PotState;
    voice: string;
    children: React.ReactNode;
}

interface PickupProps {
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
        if (!React.isValidElement<P>(child) || child.type !== type) throw new Error(`${parent} contains an unsupported child`);
        result.push(child);
    });
    return result;
}

export function PrintInstrumentSpec({ children }: { children: React.ReactNode }) {
    const pickups: React.ReactElement[] = [];
    const controls: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
        if (isEmptyChild(child)) return;
        if (!React.isValidElement(child)) throw new Error('PrintInstrumentSpec contains an unsupported child');
        if (child.type === PrintPickupConfiguration) pickups.push(child);
        else if (child.type === PrintControlLayout) controls.push(child);
        else throw new Error('PrintInstrumentSpec contains an unsupported child');
    });
    if (pickups.length !== 1 || controls.length !== 1) throw new Error('PrintInstrumentSpec requires one pickup configuration and one control layout');

    return <section data-print-instrument-spec className="space-y-2">{controls[0]}{pickups[0]}</section>;
}

export function PrintControlLayout({ children }: { children: React.ReactNode }) {
    const controls: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
        if (isEmptyChild(child)) return;
        if (!React.isValidElement(child) || (child.type !== PrintSelector && child.type !== PrintPot)) throw new Error('PrintControlLayout contains an unsupported child');
        controls.push(child);
    });
    return (
        <section className="rounded-lg border border-slate-300 p-2">
            <div className="mb-1"><p className="font-mono text-[7.5pt] font-semibold uppercase tracking-[0.18em] text-slate-600">Find its voices</p><h2 className="text-[11pt] font-semibold">Voice and control map</h2></div>
            <div className="space-y-1.5">{controls}</div>
        </section>
    );
}

export function PrintSelector({ label, positions, children }: { label: string; positions: SelectorCount; children: React.ReactNode }) {
    const items = elementChildren(children, PrintSelectorPosition, label);
    if (items.length !== positions) throw new Error(`${label} declares ${positions} positions but contains ${items.length}`);
    return (
        <section className="rounded-md border border-slate-300 bg-slate-50 p-1.5">
            <div className="mb-1 flex justify-between"><h3 className="text-[8.5pt] font-semibold">{label}</h3><span className="font-mono text-[7pt] uppercase tracking-wider text-slate-500">{positions}-way selector</span></div>
            <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${positions}, minmax(0, 1fr))` }}>{items.map((item, index) => React.cloneElement(item, { index: index + 1, key: `${label}-${index}` }))}</ol>
        </section>
    );
}

export function PrintSelectorPosition({ voice, children, index }: SelectorPositionProps) {
    if (!index) throw new Error('PrintSelectorPosition must be rendered inside PrintSelector');
    return <li className="rounded border border-slate-300 bg-white p-1.5 text-[7.5pt] leading-[1.2]"><span className="mb-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 font-mono text-[7pt] font-bold text-white">{index}</span><p className="font-semibold text-slate-800">{voice}</p><div className="mt-0.5 text-slate-600">{children}</div></li>;
}

export function PrintPot({ label, mechanism, children }: { label: string; mechanism: PotMechanism; children: React.ReactNode }) {
    const items = elementChildren(children, PrintPotPosition, label);
    const states = items.map((item) => item.props.position);
    const valid = mechanism === 'standard' ? states.length === 1 && states[0] === 'normal' : states.length === 2 && states.includes('down') && states.includes('up');
    if (!valid) throw new Error(`${label} has invalid ${mechanism} positions`);
    return <section className="rounded-md border border-slate-300 bg-slate-50 p-1.5"><div className="mb-1 flex justify-between"><h3 className="text-[8.5pt] font-semibold">{label}</h3><span className="font-mono text-[7pt] uppercase tracking-wider text-slate-500">{mechanism.replace('-', ' ')}</span></div><div className={items.length === 1 ? 'grid' : 'grid grid-cols-2 gap-1'}>{items}</div></section>;
}

export function PrintPotPosition({ position, voice, children }: PotPositionProps) {
    return <div className="rounded border border-slate-300 bg-white p-1.5 text-[7.5pt] leading-[1.2]"><p className="font-mono text-[6.8pt] font-semibold uppercase tracking-[0.14em] text-slate-600">{position}</p><p className="mt-0.5 font-semibold text-slate-800">{voice}</p><div className="mt-0.5 text-slate-600">{children}</div></div>;
}

export function PrintPickupConfiguration({ children }: { children: React.ReactNode }) {
    const pickups = elementChildren(children, PrintPickup, 'PrintPickupConfiguration');
    return <section className="rounded-lg border border-slate-300 p-2"><div className="mb-1 flex items-baseline justify-between"><div><p className="font-mono text-[7.5pt] font-semibold uppercase tracking-[0.18em] text-slate-600">Magnetic voice</p><h2 className="text-[11pt] font-semibold">Humbucker configuration</h2></div></div><div className="grid grid-cols-2 gap-1.5">{pickups}</div></section>;
}

export function PrintPickup({ position, type, brand, model }: PickupProps) {
    return <article className="rounded-md border border-slate-300 bg-slate-50 p-1.5"><p className="font-mono text-[6.8pt] font-semibold uppercase tracking-[0.14em] text-slate-600">{position}</p><h3 className="mt-0.5 text-[8pt] font-semibold leading-tight">{brand} {model}</h3><p className="mt-0.5 text-[7pt] capitalize text-slate-600">{type.replaceAll('-', ' ')}</p></article>;
}

export function PrintPickupDetail(_: { label: string; children: React.ReactNode }) {
    return null;
}
