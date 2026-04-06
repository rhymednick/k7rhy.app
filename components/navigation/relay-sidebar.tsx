'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav, relayPlatformNav } from '@/config/relay-nav';
import type { RelayBreadcrumb } from '@/lib/relay';
import { MyBreadcrumbs } from '@/components/doc/doc-page';
import { RelayModelLineupNav } from '@/components/relay/relay-model-lineup-nav';

const PLATFORM_HREF = '/docs/relay';
const PLATFORM_LABEL = 'Relay Guitar Platform';
const CHOOSE_MODEL_HREF = '/docs/relay/printing/choose-model';

// ─── Platform-level sidebar ───────────────────────────────────────────────────

function PlatformSidebar() {
    const pathname = usePathname();

    return (
        <nav aria-label="Relay Guitar Platform navigation" className="w-full">
            {/* Platform overview link */}
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

            {relayPlatformNav.sections.map((section, i) => (
                <React.Fragment key={i}>
                    {section.slug && !section.items?.length ? (
                        <div className="pb-4">
                            <div className="grid grid-flow-row auto-rows-max text-sm">
                                <Link
                                    href={`/docs/relay/${section.slug}`}
                                    className={cn(
                                        'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                                        pathname === `/docs/relay/${section.slug}` ? 'font-medium text-foreground' : 'text-muted-foreground',
                                    )}
                                >
                                    {section.title}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-4">
                            <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{section.title}</h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm">
                                {section.items?.map((item, j) => {
                                    const href = `/docs/relay/${item.slug}`;
                                    const isActive = pathname === href;
                                    return (
                                        <Link
                                            key={j}
                                            href={href}
                                            className={cn(
                                                'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                                                isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* After Getting started, surface the full lineup before Printing */}
                    {i === 0 && (
                        <div className="pb-4">
                            <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">Models</h4>
                            <RelayModelLineupNav />
                        </div>
                    )}
                </React.Fragment>
            ))}

            <div className="border-t pt-4">
                <Link href="/docs" className="flex w-full items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:underline">
                    ← All Documentation
                </Link>
            </div>
        </nav>
    );
}

// ─── Model-level sidebar ──────────────────────────────────────────────────────

function ModelSidebar({ model }: { model: string }) {
    const pathname = usePathname();
    const modelNav = relayNav[model];

    if (!modelNav) return null;

    const modelRootHref = `/docs/relay/${model}`;
    const isModelRootActive = pathname === modelRootHref;

    return (
        <nav aria-label="Relay documentation" className="w-full">
            {/* Platform back-link */}
            <div className="pb-3">
                <Link
                    href={PLATFORM_HREF}
                    className="block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                    {PLATFORM_LABEL}
                </Link>
            </div>

            {/* Model root link */}
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

            {/* Model sections */}
            {modelNav.sections.map((section, i) => {
                const isModelSection = section.title === modelNav.title;
                return (
                    <div key={i} className="pb-4">
                        {!isModelSection && <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{section.title}</h4>}
                        <div className="grid grid-flow-row auto-rows-max text-sm">
                            {(section.items ?? []).map((item, j) => {
                                const href = `/docs/relay/${model}/${item.slug}`;
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={j}
                                        href={href}
                                        className={cn(
                                            'flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                                            isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            <div className="border-t pt-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">All models</h4>
                <RelayModelLineupNav />
                <div className="mt-2 grid grid-flow-row auto-rows-max text-sm">
                    <Link
                        href={CHOOSE_MODEL_HREF}
                        className={cn(
                            'rounded-md border border-transparent px-2 py-1 hover:underline',
                            pathname === CHOOSE_MODEL_HREF ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        Choosing a model
                    </Link>
                </div>
            </div>

            <div className="border-t pt-4">
                <Link href="/docs" className="flex w-full items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:underline">
                    ← All Documentation
                </Link>
            </div>
        </nav>
    );
}

// ─── Auto-switching sidebar ───────────────────────────────────────────────────

const PLATFORM_SECTIONS = ['printing', 'build', 'assembly', 'electronics', 'setup'];

export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';
    const segments = pathname.split('/').filter(Boolean);
    const relayIndex = segments.indexOf('relay');
    const nextSegment = relayIndex >= 0 ? (segments[relayIndex + 1] ?? '') : '';

    if (!nextSegment || PLATFORM_SECTIONS.includes(nextSegment)) {
        return <PlatformSidebar />;
    }

    return <ModelSidebar model={nextSegment} />;
}

// ─── Breadcrumb bar ───────────────────────────────────────────────────────────

export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
