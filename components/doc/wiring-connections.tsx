import React from 'react';

interface WiringConnectionsProps {
    children: React.ReactNode;
}

interface WireConnectionProps {
    from: string;
    to: string;
    notes?: string;
}

export function WiringConnections({ children }: WiringConnectionsProps) {
    return (
        <div className="my-4 overflow-hidden rounded-lg border text-sm">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</th>
                        <th className="py-2 pl-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</th>
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export function WireConnection({ from, to, notes }: WireConnectionProps) {
    return (
        <tr className="border-b last:border-0 hover:bg-muted/20">
            <td className="py-2.5 pl-4 pr-3">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{from}</code>
            </td>
            <td className="px-3 py-2.5">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{to}</code>
            </td>
            <td className="py-2.5 pl-3 pr-4 text-muted-foreground">{notes ?? ''}</td>
        </tr>
    );
}
