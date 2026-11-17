import React from 'react';

type ChildrenProps = { children: React.ReactNode };
type SectionProps = ChildrenProps & { title: string };
type DetailProps = ChildrenProps & { label: string; printDescription?: string };
function items(children: React.ReactNode, allowed: React.ElementType, name: string) {
    const result: React.ReactElement[] = [];
    React.Children.forEach(children, (child) => {
        if (child === null || child === undefined || (typeof child === 'string' && !child.trim())) return;
        if (!React.isValidElement(child) || child.type !== allowed) throw new Error(`${name} contains an unsupported child`);
        result.push(child);
    });
    if (!result.length) throw new Error(`${name} requires at least one entry`);
    return result;
}
export function AmplifierSpec({ children }: ChildrenProps) {
    const sections = items(children, AmplifierSection, 'AmplifierSpec');
    return (
        <section data-amplifier-spec className="grid gap-5 md:grid-cols-2">
            {sections}
        </section>
    );
}
export function AmplifierSection({ title, children }: SectionProps) {
    if (!title.trim()) throw new Error('AmplifierSection requires a title');
    const details = items(children, AmplifierDetail, title);
    return (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">{title}</h2>
            <dl className="space-y-3">{details}</dl>
        </section>
    );
}
export function AmplifierDetail({ label, children }: DetailProps) {
    if (!label.trim() || React.Children.count(children) === 0) throw new Error('AmplifierDetail requires a label and description');
    return (
        <div>
            <dt className="font-semibold">{label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</dd>
        </div>
    );
}
export function PrintAmplifierSpec({ children }: ChildrenProps) {
    const sections = items(children, PrintAmplifierSection, 'PrintAmplifierSpec');
    return (
        <section data-print-instrument-spec data-print-amplifier-spec className="grid grid-cols-2 items-start gap-2">
            {sections}
        </section>
    );
}
export function PrintAmplifierSection({ title, children }: SectionProps) {
    if (!title.trim()) throw new Error('PrintAmplifierSection requires a title');
    const details = items(children, PrintAmplifierDetail, title);
    return (
        <section className="rounded-lg border border-slate-300 p-2">
            <h2 className="mb-2 text-[10pt] font-semibold">{title}</h2>
            <dl className="space-y-1.5 text-[8pt] leading-[1.25]">{details}</dl>
        </section>
    );
}
export function PrintAmplifierDetail({ label, printDescription, children }: DetailProps) {
    if (!label.trim() || React.Children.count(children) === 0) throw new Error('PrintAmplifierDetail requires a label and description');
    return (
        <div>
            <dt className="font-semibold text-slate-900">{label}</dt>
            <dd className="text-slate-600">{printDescription ?? children}</dd>
        </div>
    );
}
