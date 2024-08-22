"use client"
import React from 'react';

export default function ViewportDebugLabel() {
    if (process.env.NODE_ENV !== 'development') {
        return null; // Do not render in production mode
    }
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