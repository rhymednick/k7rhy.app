'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { coupevilleModels } from '@/config/coupeville-models';

const OVERVIEW_HREF = '/guitars/coupeville';
const GUITARS_HREF = '/guitars';

function SidebarLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link href={href} className={cn('flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:underline', active ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {label}
        </Link>
    );
}

export function CoupevilleLayoutSidebar() {
    const pathname = usePathname() ?? '';

    return (
        <nav aria-label="Coupeville navigation" className="w-full">
            <div className="pb-4">
                <SidebarLink href={GUITARS_HREF} label="← Guitars" active={false} />
                <SidebarLink href={OVERVIEW_HREF} label="Overview" active={pathname === OVERVIEW_HREF} />
            </div>

            <div>
                <h4 className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Models</h4>
                <ul className="grid grid-flow-row auto-rows-max">
                    {coupevilleModels.map((model) => (
                        <li key={model.slug}>
                            <SidebarLink href={model.href} label={model.name} active={pathname === model.href} />
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
