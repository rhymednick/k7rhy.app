'use client';

import type * as React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink } from 'lucide-react';
import { relayVoicings } from '@/config/relay-voicings';
import { getCachedPrice } from '@/lib/amazon-prices';
import { cn } from '@/lib/utils';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord } from '@/types/relay-components';

interface RelayComponentsShoppingListProps {
    components: RelayComponentRecord[];
    allModelSpecificComponents: RelayComponentRecord[];
    initialVoicing?: string;
}

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

export function RelayComponentsShoppingList({ components, allModelSpecificComponents, initialVoicing }: RelayComponentsShoppingListProps) {
    const router = useRouter();
    const [selectedVoicing, setSelectedVoicing] = useState(initialVoicing ?? '');
    const grouped = useMemo(() => groupComponentsByCategory(components), [components]);

    const selectedVoicingEntry = relayVoicings.find((voicing) => voicing.slug === selectedVoicing);
    const selectedElectronicsCount = components.filter((component) => component.scope === 'model').length;

    function selectVoicing(nextVoicing: string) {
        setSelectedVoicing(nextVoicing);
        const hash = window.location.hash || '';
        router.replace(nextVoicing ? `/relay/components?voicing=${nextVoicing}${hash}` : `/relay/components${hash}`);
    }

    return (
        <div className="mt-8 space-y-8">
            <div className="rounded-lg border p-4">
                <h2 className="text-base font-semibold">Select your instrument voice.</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
                    {relayVoicings.map((voicing) => {
                        const isSelected = selectedVoicing === voicing.slug;
                        return (
                            <button
                                key={voicing.slug}
                                type="button"
                                onClick={() => selectVoicing(voicing.slug)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'min-h-20 rounded-md border p-2.5 text-left transition-colors',
                                    'hover:border-sky-500 hover:bg-sky-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-border bg-background'
                                )}
                            >
                                <span className="flex items-start justify-between gap-3">
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-foreground">{voicing.name}</span>
                                    </span>
                                    {isSelected && <Check className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />}
                                </span>
                                <span className="mt-2 block text-xs leading-5 text-muted-foreground">{voicing.genres}</span>
                            </button>
                        );
                    })}
                </div>
                {!selectedVoicing && allModelSpecificComponents.length > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">Electronics vary by voicing. Start from a voicing page or select a voicing here before ordering circuit parts.</p>
                )}
                {selectedVoicingEntry && selectedElectronicsCount === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        I haven&apos;t published the electronics list for {selectedVoicingEntry.name} yet — it&apos;s still a {selectedVoicingEntry.status === 'concept' ? 'concept' : 'lab'} voicing and the circuit parts aren&apos;t final. The common platform parts below are accurate. Follow along in{' '}
                        <a href="https://discord.gg/BuUxCG4W6w" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
                            Discord
                        </a>{' '}
                        to see when it graduates.
                    </p>
                )}
            </div>

            {Object.entries(grouped).map(([category, items]) => (
                <section key={category} id={category.toLowerCase().replaceAll(' ', '-')} className="scroll-m-24">
                    <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">{category}</h2>
                    {items.length > 0 ? (
                        <div className="mt-4 rounded-lg border px-4">
                            {items.map((component) => (
                                <ComponentRow key={component.id} component={component} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No items in this category for the current selection.</p>
                    )}
                </section>
            ))}

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
