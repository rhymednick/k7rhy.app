/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { cn } from "@/lib/utils";

const NotFound = () => {
    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-2">
                <h1 className={cn("scroll-m-20 text-3xl pb-2 font-bold tracking-tight")}>Invalid Blog</h1>
                The blog entry you've requested does not exist.
            </div>
        </main >

    );
};

export default NotFound;