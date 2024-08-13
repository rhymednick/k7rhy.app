import React from 'react';
import { docsConfig } from "@/config/docs";
import { DocsSidebarNav } from "@/components/sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageNavigation } from "@/components/page-navigation";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="border-b" >
      <div className="container flex flex-col lg:flex-row lg:items-start">
        {/* Sidebar for large screens */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-14 lg:-ml-2">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <DocsSidebarNav config={docsConfig} />
          </ScrollArea>
        </aside>

        {/* Main content and navigation */}
        <div className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
          {/* Documentation Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Page Navigation */}
          <div className="lg:w-64 lg:ml-1">
            <PageNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}