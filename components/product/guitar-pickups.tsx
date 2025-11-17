import React from 'react';
import { Guitar } from '@/types/product';
import {
    PICKUP_TYPE_LABELS,
    PICKUP_POSITION_LABELS,
} from '@/config/guitar-options';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Radio } from 'lucide-react';

interface GuitarPickupsProps {
    guitar: Guitar;
}

export function GuitarPickups({ guitar }: GuitarPickupsProps) {
    if (guitar.pickups.length === 0) {
        return null;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Radio className="h-5 w-5 text-primary" />
                <h2 className={cn('text-xl font-semibold')}>Pickups</h2>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="py-2">Position</TableHead>
                        <TableHead className="py-2">Type</TableHead>
                        <TableHead className="py-2">Resistance</TableHead>
                        <TableHead className="py-2">Brand</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guitar.pickups.map((pickup, index) => (
                        <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium py-3">
                                {PICKUP_POSITION_LABELS[pickup.position]}
                            </TableCell>
                            <TableCell className="py-3">
                                {PICKUP_TYPE_LABELS[pickup.type]}
                            </TableCell>
                            <TableCell className="py-3">
                                {pickup.resistance
                                    ? `${pickup.resistance} Ω`
                                    : '—'}
                            </TableCell>
                            <TableCell className="py-3">{pickup.brand || '—'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

