import React from 'react';
import { navConfig } from '@/config/navigation';
import { DocsSidebarNav } from '@/components/navigation/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageNavigation } from '@/components/page-navigation';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="container flex flex-col lg:flex-row lg:items-start">
      <div className="flex flex-col lg:flex-row lg:flex-1 lg:gap-10">
        {/* Documentation Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
