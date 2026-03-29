import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocsConditionalSidebar, DocsConditionalPageNav } from '@/components/navigation/docs-layout-wrappers';

interface DocsLayoutProps {
    children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
    return (
        <div className="border-b">
            <div className="container flex flex-col lg:flex-row lg:items-start">
                {/* Sidebar — suppressed under /docs/relay/ */}
                <aside className="w-full lg:w-auto lg:sticky lg:top-14 lg:-ml-2 lg:min-w-[250px] lg:max-w-[325px]">
                    <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                        <DocsConditionalSidebar />
                    </ScrollArea>
                </aside>

                {/* Main content and navigation */}
                <main className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
                    <div className="flex-1">{children}</div>
                    {/* PageNavigation — suppressed under /docs/relay/ (relay layout provides its own) */}
                    <aside className="lg:w-64 lg:ml-1">
                        <DocsConditionalPageNav />
                    </aside>
                </main>
            </div>
        </div>
    );
}
