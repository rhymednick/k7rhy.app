'use client';

import React from 'react';
import { DocsSidebarNav } from '@/components/navigation/sidebar-nav';
import { PageNavigation } from '@/components/page-navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navConfig } from '@/config/navigation';

/** Renders the docs sidebar aside */
export function DocsConditionalSidebar() {
    return (
        <aside className="w-full lg:w-auto lg:sticky lg:top-14 lg:-ml-2 lg:min-w-[250px] lg:max-w-[325px]">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                <DocsSidebarNav config={navConfig.docNav} />
            </ScrollArea>
        </aside>
    );
}

/** Renders PageNavigation aside */
export function DocsConditionalPageNav() {
    return (
        <aside className="lg:w-64 lg:ml-1">
            <PageNavigation />
        </aside>
    );
}
