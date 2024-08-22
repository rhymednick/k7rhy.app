"use client"
import React from 'react';
import { useWatchVariables } from '@/components/context/watch-variables-provider';

import { createReactiveVariable } from '@/lib/createReactiveVariable';

export default function ViewportDebugLabel() {
    if (process.env.NODE_ENV !== 'development') {
        return null; // Do not render in production mode
    }
    let viewportSize = createReactiveVariable('viewportSize', 'string');
    return (
        <div className="mr-4 font-bold text-orange-500/40">
            <span className="inline md:hidden">[SM]</span>
            <span className="hidden md:inline lg:hidden">[MD]</span>
            <span className="hidden lg:inline xl:hidden">[LG]</span>
            <span className="hidden xl:inline 2xl:hidden">[XL]</span>
            <span className="hidden 2xl:inline ">[2XL]</span>
        </div>
    );
}