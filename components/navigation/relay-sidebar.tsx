'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import type { RelayBreadcrumb } from '@/lib/relay';
import { MyBreadcrumbs } from '@/components/doc/doc-page';
import { RelayModelLineupNav } from '@/components/relay/relay-model-lineup-nav';

const PLATFORM_HREF = '/relay';
const PLATFORM_LABEL = 'Relay Guitar';

// ─── Platform-level sidebar ───────────────────────────────────────────────────

function PlatformSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={PLATFORM_HREF}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            pathname === PLATFORM_HREF ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        Platform Overview
                    </Link>
                </div>
            </div>

            <div className="pb-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Models</h4>
                <RelayModelLineupNav />
            </div>
        </nav>
    );
}

// ─── Model-level sidebar ──────────────────────────────────────────────────────

function ModelSidebar({ model }: { model: string }) {
    const pathname = usePathname();
    const modelNav = relayNav[model];

    if (!modelNav) return null;

    const modelRootHref = `/relay/${model}`;
    const isModelRootActive = pathname === modelRootHref;

    return (
        <nav aria-label="Relay Guitar navigation" className="w-full">
            <div className="pb-3">
                <Link
                    href={PLATFORM_HREF}
                    className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                    ← {PLATFORM_LABEL}
                </Link>
            </div>

            <div className="pb-4">
                <div className="grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={modelRootHref}
                        className={cn(
                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                            isModelRootActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        {modelNav.title}
                    </Link>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">All models</h4>
                <RelayModelLineupNav />
            </div>
        </nav>
    );
}

// ─── Auto-switching sidebar ───────────────────────────────────────────────────

// Segments under /relay/ that are platform routes, not model keys.
const PLATFORM_SECTIONS = new Set(['build']);

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';
    const segments = pathname.split('/').filter(Boolean);
    const relayIndex = segments.indexOf('relay');
    const nextSegment = relayIndex >= 0 ? (segments[relayIndex + 1] ?? '') : '';

    if (!nextSegment || PLATFORM_SECTIONS.has(nextSegment)) {
        return <PlatformSidebar />;
    }

    return <ModelSidebar model={nextSegment} />;
}

// ─── Breadcrumb bar ───────────────────────────────────────────────────────────

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
