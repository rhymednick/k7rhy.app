import React from 'react';
import { PageNavigation } from '@/components/page-navigation';

// No section sidebar yet: pedal kit guides are unlisted until release.
export default function PedalsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="border-b">
            <div className="container flex flex-col lg:flex-row lg:items-start">
                <main className="flex flex-col lg:flex-1 lg:flex-row lg:gap-10">
                    <div className="flex-1 py-6 lg:py-8">{children}</div>
                    <aside className="lg:ml-1 lg:w-64">
                        <PageNavigation />
                    </aside>
                </main>
            </div>
        </div>
    );
}
