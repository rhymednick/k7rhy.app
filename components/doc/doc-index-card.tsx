import React from 'react';

import Link from 'next/link';
import { FileText, ExternalLink, LucideIcon } from 'lucide-react';

export enum DocIndexItemType {
    Internal, // Displays a doc page icon
    External, // Displays an external link icon
}

export interface DocIndexItem {
    title: string;
    href: string;
    description: string;
    type?: DocIndexItemType;
}

export interface DocIndexCardProps {
    title: string;
    description?: string;
    items?: DocIndexItem[];
    icon?: LucideIcon;
}

export function DocIndexCard(props: DocIndexCardProps) {
    const Icon = props.icon;

    return (
        <div className="mb-6 mt-4">
            <div className="mb-4 flex items-center gap-3">
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{props.title}</h2>
                    {props.description && <p className="text-sm text-muted-foreground">{props.description}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {props.items?.map((item, index) => {
                    const ItemIcon = item.type === DocIndexItemType.External ? ExternalLink : FileText;
                    const isExternal = item.type === DocIndexItemType.External;
                    return (
                        <Link key={index} href={item.href} target={isExternal ? '_blank' : undefined} className="group block">
                            <div className="flex h-full items-start gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all group-hover:shadow-md group-hover:scale-[1.02]">
                                <div className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                                    <ItemIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">{item.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
