'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { relayNav } from '@/config/relay-nav';
import type { RelayBreadcrumb } from '@/lib/relay';
import { MyBreadcrumbs } from '@/components/doc/doc-page';

export function RelaySidebar({ model }: { model: string }) {
    const pathname = usePathname();
    const modelNav = relayNav[model];

    if (!modelNav) return null;

    return (
        <div className="w-full">
            {/* Platform label — links to model root */}
            <div className="pb-4">
                <Link href={`/docs/relay/${model}`} className="mb-1 block rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    Relay · {modelNav.title}
                </Link>
            </div>

            {/* Sections */}
            {modelNav.sections.map((section, i) => (
                <div key={i} className="pb-4">
                    <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{section.title}</h4>
                    <div className="grid grid-flow-row auto-rows-max text-sm">
                        {section.items.map((item, j) => {
                            const href = `/docs/relay/${model}/${item.slug}`;
                            const isActive = pathname === href;
                            return (
                                <Link key={j} href={href} className={cn('group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Back link */}
            <div className="border-t pt-4">
                <Link href="/docs" className="flex w-full items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:underline">
                    ← All Documentation
                </Link>
            </div>
        </div>
    );
}

/** Used in the relay sub-layout — derives the model from pathname automatically. */
export function RelayLayoutSidebar() {
    const pathname = usePathname() ?? '';
    // e.g. /docs/relay/lipstick/printing/parameters → model = 'lipstick'
    const segments = pathname.split('/').filter(Boolean);
    const relayIndex = segments.indexOf('relay');
    const model = relayIndex >= 0 ? (segments[relayIndex + 1] ?? 'lipstick') : 'lipstick';
    return <RelaySidebar model={model} />;
}

/** Renders a breadcrumb bar using RelayBreadcrumb items from lib/relay. */
export function RelayBreadcrumbBar({ items }: { items: RelayBreadcrumb[] }) {
    return <MyBreadcrumbs items={items} />;
}
