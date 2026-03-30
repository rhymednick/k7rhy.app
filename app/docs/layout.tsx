import React from 'react';
import { DocsConditionalSidebar, DocsConditionalPageNav } from '@/components/navigation/docs-layout-wrappers';

interface DocsLayoutProps {
    children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
    return (
        <div className="border-b">
            <div className="container flex flex-col lg:flex-row lg:items-start">
                <DocsConditionalSidebar />
                <main className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
                    <div className="flex-1">{children}</div>
                    <DocsConditionalPageNav />
                </main>
            </div>
        </div>
    );
}
