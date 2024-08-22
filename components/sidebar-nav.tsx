'use client';
import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItemWithChildren } from '../types/nav';

import { cn } from '@/lib/utils';
import { env } from 'process';

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

export interface DocsSidebarNavProps {
    config: NavItemWithChildren[];
}

export function DocsSidebarNav({ config }: DocsSidebarNavProps) {
    const pathname = usePathname();

    const items = config;

    return items.length ? (
        <div className="w-full">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn('pb-4')}
                >
                    <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                        {item.title}
                    </h4>
                    {item?.items?.length && (
                        <DocsSidebarNavItems
                            items={item.items}
                            pathname={pathname}
                        />
                    )}
                </div>
            ))}
        </div>
    ) : null;
}

interface DocsSidebarNavItemsProps {
    items: NavItemWithChildren[];
    pathname: string | null;
}

export function DocsSidebarNavItems({
    items,
    pathname,
}: DocsSidebarNavItemsProps) {
    // Extracted conventional function
    function renderNavItem(item: NavItemWithChildren, index: number) {
        // The item.label is empty when the item is production-ready
        if (environment === 'production' && item.label) {
            return null;
        }

        if (item.href) {
            // Condition: item has a href and is not disabled
            return (
                <Link
                    key={index}
                    href={item.href}
                    className={cn(
                        'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                        pathname === item.href
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                    )}
                    target={item.external ? '_blank' : ''}
                    rel={item.external ? 'noreferrer' : ''}
                >
                    {item.title}
                    {item.label && (
                        <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                            {item.label}
                        </span>
                    )}
                </Link>
            );
        } else {
            // Condition: item does not have a href, so just show the title
            return (
                <span
                    key={index}
                    className={cn(
                        'flex w-full items-center rounded-md p-2 text-muted-foreground hover:underline'
                    )}
                >
                    {item.title}
                    {item.label && (
                        <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                            {item.label}
                        </span>
                    )}
                </span>
            );
        }
    }

    return items?.length ? (
        <div className="grid grid-flow-row auto-rows-max text-sm">
            {items.map(renderNavItem)}
        </div>
    ) : null;
}
