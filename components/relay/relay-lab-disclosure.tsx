import React from 'react';

export function RelayLabDisclosure() {
    return (
        <div className="my-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Lab model</p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
                This model's design is complete but hasn't been physically built and validated yet. Component choices and wiring
                details may change after testing. Join the Discord to follow development and share early builds.
            </p>
        </div>
    );
}
