'use client';
import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { navConfig } from '@/config/navigation';

export function MainNav() {
    const pathname = usePathname() + '';

    return (
        <div className="mr-2 md:mr-4 hidden md:flex">
            <Link href="/" className="mr-2 md:mr-4 flex items-center space-x-2 lg:mr-6">
                <Image src="/images/k7rhy_logo.png" alt="K7RHY logo" width={36} height={36} className="dark:invert" />
                <span className="hidden text-lg font-bold lg:inline-block">{siteConfig.name}</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
                {navConfig.mainNav.map((item) => {
                    const isActive = item.href && pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href || ''}
                            className={cn(
                                'relative transition-colors hover:text-foreground/80',
                                isActive ? 'font-medium text-foreground after:absolute after:inset-x-0 after:-bottom-2 after:h-0.5 after:bg-gradient-to-r after:from-sky-500 after:to-emerald-600' : 'text-foreground/60'
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
