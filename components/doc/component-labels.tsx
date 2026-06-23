import React from 'react';

const WIRE_COLORS: Record<string, string> = {
    red: '#ef4444',
    black: '#1f2937',
    white: '#e5e7eb',
    green: '#22c55e',
    yellow: '#fbbf24',
    blue: '#3b82f6',
    bare: '#d4b483',
    silver: '#9ca3af',
    orange: '#f97316',
    shield: '#9ca3af',
};

function resolveWireColor(wire: string): string {
    return WIRE_COLORS[wire.toLowerCase()] ?? wire;
}

interface ComponentLabelsProps {
    children: React.ReactNode;
}

interface ComponentLabelProps {
    id: string;
    component: string;
    wire?: string;
    description: string;
}

export function ComponentLabels({ children }: ComponentLabelsProps) {
    return (
        <div className="my-4 overflow-hidden rounded-lg border text-sm">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Label</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Component</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wire</th>
                        <th className="py-2 pl-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

export function ComponentLabel({ id, component, wire, description }: ComponentLabelProps) {
    const color = wire ? resolveWireColor(wire) : null;
    const isDark = wire?.toLowerCase() === 'black';

    return (
        <tr className="border-b last:border-0 hover:bg-muted/20">
            <td className="py-2 pl-4 pr-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{id}</td>
            <td className="px-3 py-2 text-muted-foreground">{component}</td>
            <td className="px-3 py-2">
                {color && (
                    <span className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                        />
                        <span className={isDark ? 'text-xs capitalize dark:text-muted-foreground' : 'text-xs capitalize text-muted-foreground'}>{wire}</span>
                    </span>
                )}
            </td>
            <td className="py-2 pl-3 pr-4 text-muted-foreground">{description}</td>
        </tr>
    );
}
