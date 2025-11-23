import React from 'react';
import { navConfig } from "@/config/navigation";
import { DocsSidebarNav } from "@/components/navigation/sidebar-nav";
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
        <aside className="w-full lg:w-auto lg:sticky lg:top-14 lg:-ml-2 lg:min-w-[250px] lg:max-w-[325px]">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <DocsSidebarNav config={navConfig.docNav} />
          </ScrollArea>
        </aside>

        {/* Main content and navigation */}
        <main className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
          {/* Documentation Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Page Navigation */}
          <aside className="lg:w-64 lg:ml-1 ">
            <PageNavigation />
          </aside>
        </main>
      </div>
    </div>
  );
}