import React from 'react';
import { Guitar, Material } from '@/types/product';
import { MATERIAL_LABELS } from '@/config/guitar-options';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface GuitarSpecsProps {
    guitar: Guitar;
}

function formatMaterials(materials: Material | Material[]): string {
    if (Array.isArray(materials)) {
        return materials.map((m) => MATERIAL_LABELS[m]).join(', ');
    }
    return MATERIAL_LABELS[materials];
}

export function GuitarSpecs({ guitar }: GuitarSpecsProps) {
    return (
        <div>
            <h2 className={cn('text-xl font-semibold mb-2')}>Specifications</h2>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-semibold py-2">Body Core</TableCell>
                        <TableCell className="py-2">
                            {formatMaterials(guitar.bodyCore)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold py-2">Body Shell</TableCell>
                        <TableCell className="py-2">
                            {formatMaterials(guitar.bodyShell)}
                        </TableCell>
                    </TableRow>
                    {guitar.pickups.length > 0 && (
                        <TableRow>
                            <TableCell className="font-semibold py-2">Pickups</TableCell>
                            <TableCell className="py-2">{guitar.pickups.length}</TableCell>
                        </TableRow>
                    )}
                    {guitar.controls.length > 0 && (
                        <TableRow>
                            <TableCell className="font-semibold py-2">Controls</TableCell>
                            <TableCell className="py-2">{guitar.controls.length}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

