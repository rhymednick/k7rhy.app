import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { relayVoicings } from '@/config/relay-voicings';
import type { RelayVoicing, RelayVoicingStatus } from '@/types/relay-voicing';
import { RelayPickupMap } from '@/components/relay/relay-pickup-map';

const statusCopy: Partial<Record<RelayVoicingStatus, { title: string; body: string; className: string }>> = {
    lab: {
        title: 'Lab voicing',
        body: "This voicing's design is defined but has not been physically built and validated yet. Component choices and wiring details may change after testing.",
        className: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300',
    },
    concept: {
        title: 'Concept voicing',
        body: 'This voicing is still exploratory. The target behavior is documented, but switching, parts, and final interaction details are not finalized.',
        className: 'border-slate-500/30 bg-slate-500/5 text-slate-800 dark:text-slate-300',
    },
};

function getRelayVoicing(slug: string): RelayVoicing | undefined {
    return relayVoicings.find((voicing) => voicing.slug === slug);
}

export function RelayVoicingOverview({ voicingSlug, children }: { voicingSlug: string; children: React.ReactNode }) {
    const voicing = getRelayVoicing(voicingSlug);

    if (!voicing) {
        return <>{children}</>;
    }

    const status = statusCopy[voicing.status];

    return (
        <>
            <div className="my-6 space-y-5">
                {status && (
                    <div data-relay-status-callout className={cn('rounded-xl border p-4 text-sm', status.className)}>
                        <p className="font-semibold">{status.title}</p>
                        <p className="mt-1 opacity-90">{status.body}</p>
                    </div>
                )}

                <div data-relay-overview-summary>
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{voicing.tagline}</p>
                        <p className="max-w-3xl text-sm text-muted-foreground">{voicing.description}</p>
                    </div>
                </div>

                <RelayPickupMap {...voicing.pickupMap} />

                <div className="rounded-xl border bg-card p-4 text-sm">
                    <p className="font-semibold">Pickup interaction: {voicing.interaction.category}</p>
                    <p className="mt-1 text-muted-foreground">{voicing.interaction.summary}</p>
                </div>
            </div>

            {children}

            <div className="mt-8 rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Parts profile</h2>
                        <p className="mt-1 text-sm text-muted-foreground">This model uses the shared Relay body and hardware set. The component list page adds model-specific electronics when this voicing is selected.</p>
                    </div>
                    <Link href={`/relay/components?voicing=${voicingSlug}#electronics`} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-center text-sm font-medium leading-tight hover:bg-muted sm:w-auto sm:shrink-0 sm:whitespace-nowrap">
                        <ShoppingBag className="h-4 w-4" />
                        View shopping list
                    </Link>
                </div>
            </div>
        </>
    );
}

const sectionTitles: Record<string, string> = {
    'what-it-is': 'What it is',
    'pickup-interaction': 'Pickup interaction',
    controls: 'Controls',
    'how-it-behaves': 'How it behaves',
    'who-its-for': "Who it's for",
};

export function RelayVoicingSection({ name, title, children }: { name: string; title?: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">{title ?? sectionTitles[name] ?? name}</h2>
            {children}
        </section>
    );
}
