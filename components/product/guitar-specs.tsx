import React from 'react';
import { Guitar, Material } from '@/types/product';
import { MATERIAL_LABELS } from '@/config/guitar-options';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Settings2 } from 'lucide-react';

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
        <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className={cn('text-xl font-semibold')}>Specifications</h2>
            </div>
            <Table>
                <TableBody>
                    <TableRow className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-semibold py-3">Body Core</TableCell>
                        <TableCell className="py-3">
                            {formatMaterials(guitar.bodyCore)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-semibold py-3">Body Shell</TableCell>
                        <TableCell className="py-3">
                            {formatMaterials(guitar.bodyShell)}
                        </TableCell>
                    </TableRow>
                    {guitar.pickups.length > 0 && (
                        <TableRow className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-semibold py-3">Pickups</TableCell>
                            <TableCell className="py-3">{guitar.pickups.length}</TableCell>
                        </TableRow>
                    )}
                    {guitar.controls.length > 0 && (
                        <TableRow className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-semibold py-3">Controls</TableCell>
                            <TableCell className="py-3">{guitar.controls.length}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

