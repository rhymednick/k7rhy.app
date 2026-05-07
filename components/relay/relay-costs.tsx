import React from 'react';

interface CostItem {
    title: string;
    body: string;
}

interface RelayCostsProps {
    items: CostItem[];
}

export function RelayCosts({ items }: RelayCostsProps) {
    return (
        <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {items.map((item) => (
                <div key={item.title} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
            ))}
        </div>
    );
}
