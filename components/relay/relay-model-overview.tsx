import React from 'react';
import { cn } from '@/lib/utils';
import { relayModels } from '@/config/relay-models';
import type { RelayModel, RelayModelStatus } from '@/types/relay-model';
import { RelayPickupMap } from '@/components/relay/relay-pickup-map';

const statusCopy: Partial<Record<RelayModelStatus, { title: string; body: string; className: string }>> = {
    lab: {
        title: 'Lab model',
        body: "This model's design is defined but has not been physically built and validated yet. Component choices and wiring details may change after testing.",
        className: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300',
    },
    concept: {
        title: 'Concept model',
        body: 'This model is still exploratory. The target behavior is documented, but switching, parts, and final interaction details are not finalized.',
        className: 'border-slate-500/30 bg-slate-500/5 text-slate-800 dark:text-slate-300',
    },
};

function getRelayModel(modelKey: string): RelayModel | undefined {
    return relayModels.find((model) => model.modelKey === modelKey);
}

export function RelayModelOverview({ modelKey, children }: { modelKey: string; children: React.ReactNode }) {
    const model = getRelayModel(modelKey);

    if (!model) {
        return <>{children}</>;
    }

    const status = statusCopy[model.status];

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
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{model.tagline}</p>
                        <p className="max-w-3xl text-sm text-muted-foreground">{model.description}</p>
                    </div>
                </div>

                <RelayPickupMap {...model.pickupMap} />

                <div className="rounded-xl border bg-card p-4 text-sm">
                    <p className="font-semibold">Pickup interaction: {model.interaction.category}</p>
                    <p className="mt-1 text-muted-foreground">{model.interaction.summary}</p>
                </div>
            </div>

            {children}
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

export function RelayModelSection({ name, title, children }: { name: string; title?: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">{title ?? sectionTitles[name] ?? name}</h2>
            {children}
        </section>
    );
}
