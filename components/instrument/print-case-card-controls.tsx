'use client';

import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

export function PrintCaseCardControls() {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="instrument-print-controls mx-auto flex max-w-[7.8in] items-center justify-between gap-4 px-4 pt-6 print:hidden">
            <p className="text-sm text-muted-foreground">The card is formatted for one portrait Letter or A4 page.</p>
            <button type="button" onClick={() => window.print()} className="inline-flex shrink-0 items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print case card
            </button>
        </div>
    );
}
