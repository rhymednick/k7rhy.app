import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getCachedPrice } from '@/lib/amazon-prices';
import { cn } from '@/lib/utils';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord } from '@/types/relay-components';

function groupComponentsByCategory(components: RelayComponentRecord[]): Record<RelayComponentCategory, RelayComponentRecord[]> {
    return relayComponentCategories.reduce(
        (groups, category) => {
            groups[category] = components.filter((component) => component.category === category);
            return groups;
        },
        {} as Record<RelayComponentCategory, RelayComponentRecord[]>
    );
}

function ComponentBadge({ children, tone }: { children: React.ReactNode; tone: 'amber' | 'green' }) {
    const tones = {
        amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };
    return <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

function ComponentRow({ component }: { component: RelayComponentRecord }) {
    const price = getCachedPrice(component.priceKey, component.fallbackPrice);
    return (
        <div className="border-b py-4 last:border-b-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-base font-semibold">{component.title}</h3>
                        <ComponentBadge tone={component.specificity === 'specific' ? 'amber' : 'green'}>{component.specificity === 'specific' ? 'Specific' : 'Flexible'}</ComponentBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">Quantity: {component.quantity}</p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                    <a href={component.source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
                        {component.source.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <div>{price}</div>
                </div>
            </div>
            {component.content && <p className="mt-2 text-sm text-muted-foreground">{component.content}</p>}
            {component.substitution && (
                <div className="mt-3 rounded-md border-l-2 border-emerald-500/40 pl-3 text-sm text-muted-foreground">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Alternative: </span>
                    {component.substitution}
                </div>
            )}
        </div>
    );
}

export function RelayComponentsShoppingList({ components, voicingTabs }: { components: RelayComponentRecord[]; voicingTabs?: React.ReactNode }) {
    const grouped = groupComponentsByCategory(components);
    return (
        <div className="mt-8 space-y-8">
            {relayComponentCategories.map((category) => {
                const items = grouped[category];
                return (
                    <React.Fragment key={category}>
                        {category === 'Electronics' && voicingTabs}
                        <section id={category.toLowerCase().replaceAll(' ', '-')} className="scroll-m-24">
                            <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">{category}</h2>
                            {items.length > 0 ? (
                                <div className="mt-4 rounded-lg border px-4">
                                    {items.map((component) => (
                                        <ComponentRow key={component.id} component={component} />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-muted-foreground">No items in this category for this voicing.</p>
                            )}
                        </section>
                    </React.Fragment>
                );
            })}
            <p className="text-sm text-muted-foreground">
                Fit-sensitive parts still need compatibility checks before purchase — the item notes above call out the constraints that matter. When a dimension or substitution is in doubt, ask in{' '}
                <a href="https://discord.gg/BuUxCG4W6w" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
                    Discord
                </a>{' '}
                before ordering.
            </p>
        </div>
    );
}
