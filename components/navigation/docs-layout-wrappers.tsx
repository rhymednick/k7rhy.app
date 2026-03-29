'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DocsSidebarNav } from '@/components/navigation/sidebar-nav';
import { PageNavigation } from '@/components/page-navigation';
import { navConfig } from '@/config/navigation';

/** Renders the docs sidebar, hidden when inside /docs/relay/ */
export function DocsConditionalSidebar() {
    const pathname = usePathname();
    if (pathname?.startsWith('/docs/relay')) return null;
    return <DocsSidebarNav config={navConfig.docNav} />;
}

/** Renders PageNavigation, hidden when inside /docs/relay/ (relay layout provides its own) */
export function DocsConditionalPageNav() {
    const pathname = usePathname();
    if (pathname?.startsWith('/docs/relay')) return null;
    return <PageNavigation />;
}
