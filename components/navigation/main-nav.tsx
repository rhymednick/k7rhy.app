'use client';
import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';
import { navConfig } from '@/config/navigation';

export function MainNav() {
    const pathname = usePathname() + '';

    return (
        <div className="mr-2 md:mr-4 hidden md:flex">
            <Link
                href="/"
                className="mr-2 md:mr-4 flex items-center space-x-2 lg:mr-6"
            >
                <Icons.logo className="h-9 w-9" />
                <span className="hidden text-lg font-bold lg:inline-block">
                    {siteConfig.name}
                </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
                {navConfig.mainNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href || ''}
                        className={cn(
                            'transition-colors hover:text-foreground/80',
                            item.href && pathname.startsWith(item.href)
                                ? 'text-foreground'
                                : 'text-foreground/60'
                        )}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
