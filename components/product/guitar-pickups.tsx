import React from 'react';
import { Guitar } from '@/types/product';
import {
    PICKUP_TYPE_LABELS,
    PICKUP_POSITION_LABELS,
} from '@/config/guitar-options';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface GuitarPickupsProps {
    guitar: Guitar;
}

export function GuitarPickups({ guitar }: GuitarPickupsProps) {
    if (guitar.pickups.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className={cn('text-xl font-semibold mb-2')}>Pickups</h2>
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
                        <TableRow key={index}>
                            <TableCell className="font-medium py-2">
                                {PICKUP_POSITION_LABELS[pickup.position]}
                            </TableCell>
                            <TableCell className="py-2">
                                {PICKUP_TYPE_LABELS[pickup.type]}
                            </TableCell>
                            <TableCell className="py-2">
                                {pickup.resistance
                                    ? `${pickup.resistance} Ω`
                                    : '—'}
                            </TableCell>
                            <TableCell className="py-2">{pickup.brand || '—'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

