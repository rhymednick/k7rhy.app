'use client';

import type * as React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink } from 'lucide-react';
import { relayVoicings } from '@/config/relay-voicings';
import { getCachedPrice } from '@/lib/amazon-prices';
import { cn } from '@/lib/utils';
import { relayComponentCategories, type RelayComponentCategory, type RelayComponentRecord } from '@/types/relay-components';

interface RelayComponentsShoppingListProps {
    components: RelayComponentRecord[];
    allModelSpecificComponents: RelayComponentRecord[];
    initialModel?: string;
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

export function RelayComponentsShoppingList({ components, allModelSpecificComponents, initialModel }: RelayComponentsShoppingListProps) {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState(initialModel ?? '');
    const grouped = useMemo(() => groupComponentsByCategory(components), [components]);
    const selectedVoicing = relayVoicings.find((voicing) => voicing.slug === selectedModel);

    function selectModel(nextModel: string) {
        setSelectedModel(nextModel);
        const hash = window.location.hash || '';
        router.replace(nextModel ? `/relay/components?model=${nextModel}${hash}` : `/relay/components${hash}`);
    }

    return (
        <div className="mt-8 space-y-8">
            <div className="rounded-lg border p-4">
                <div className="space-y-1">
                    <h2 className="text-base font-semibold">Select your instrument voice.</h2>
                    <p className="text-sm text-muted-foreground">
                        Pick a Relay voicing to add the electronics that change by model. Shared body construction and guitar hardware remain visible for every build.
                    </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {relayVoicings.map((voicing) => {
                        const isSelected = selectedModel === voicing.slug;
                        return (
                            <button
                                key={voicing.slug}
                                type="button"
                                onClick={() => selectModel(voicing.slug)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'min-h-[128px] rounded-md border p-3 text-left transition-colors',
                                    'hover:border-sky-500 hover:bg-sky-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-border bg-background'
                                )}
                            >
                                <span className="flex items-start justify-between gap-3">
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-foreground">{voicing.name}</span>
                                        <span className="mt-1 block text-xs text-muted-foreground">{voicing.tagline}</span>
                                    </span>
                                    {isSelected && <Check className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />}
                                </span>
                                <span className="mt-3 block text-xs leading-5 text-muted-foreground">{voicing.genres}</span>
                            </button>
                        );
                    })}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    {selectedVoicing ? `Showing shared Relay parts plus model-specific electronics for ${selectedVoicing.name}.` : 'Showing shared platform parts. Choose a model to include model-specific electronics.'}
                </p>
                {!selectedModel && allModelSpecificComponents.length > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">Electronics vary by model. Start from a voicing page or select a model here before ordering circuit parts.</p>
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
                Fit-sensitive parts still need compatibility checks before purchase. Start with <Link href="/relay/lipstick/compatibility">What Will Fit</Link> when a dimension or substitution matters.
            </p>
        </div>
    );
}
