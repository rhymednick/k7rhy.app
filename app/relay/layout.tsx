import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageNavigation } from '@/components/page-navigation';
import { RelayLayoutSidebar } from '@/components/navigation/relay-sidebar';

export default function RelayLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="border-b">
            <div className="container flex flex-col lg:flex-row lg:items-start">
                <aside className="w-full lg:sticky lg:top-14 lg:-ml-2 lg:w-auto lg:min-w-[220px] lg:max-w-[280px]">
                    <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                        <RelayLayoutSidebar />
                    </ScrollArea>
                </aside>
                <main className="flex flex-col lg:flex-1 lg:flex-row lg:gap-10">
                    <div className="flex-1">{children}</div>
                    <aside className="lg:ml-1 lg:w-64">
                        <PageNavigation />
                    </aside>
                </main>
            </div>
        </div>
    );
}
