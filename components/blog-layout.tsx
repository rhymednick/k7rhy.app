import { cn } from "@/lib/utils"
import Link from "next/link"
import React from 'react';

interface BlogLayoutProps {
    title: string
    date: string
    tags?: string[]
    children?: React.ReactNode
}

export default function BlogLayout(props: BlogLayoutProps) {
    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-2">
                <h1 className={cn("scroll-m-20 text-3xl pb-2 font-bold tracking-tight")}>{props.title}</h1>
                <p className="text-muted-foreground">{props.date}</p>

                {props.children}
            </div>
        </main>
    );
}
