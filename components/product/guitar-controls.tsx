import React from 'react';
import { Guitar, SwitchType, KnobType } from '@/types/product';
import {
    SWITCH_TYPE_LABELS,
    KNOB_TYPE_LABELS,
} from '@/config/guitar-options';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface GuitarControlsProps {
    guitar: Guitar;
}

export function GuitarControls({ guitar }: GuitarControlsProps) {
    if (guitar.controls.length === 0) {
        return null;
    }

    const getControlTypeLabel = (type: KnobType | SwitchType): string => {
        if (Object.values(KnobType).includes(type as KnobType)) {
            return KNOB_TYPE_LABELS[type as KnobType];
        }
        return SWITCH_TYPE_LABELS[type as SwitchType];
    };

    return (
        <div>
            <h2 className={cn('text-xl font-semibold mb-2')}>Controls</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="py-2">Type</TableHead>
                        <TableHead className="py-2">Usage</TableHead>
                        <TableHead className="py-2">Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guitar.controls.map((control, index) => {
                        const details: string[] = [];
                        
                        if (control.isPushPull) {
                            details.push('Push-pull');
                        }
                        if (control.isPushPush) {
                            details.push('Push-push');
                        }
                        if (control.switchPositions && control.switchPositions.length > 0) {
                            details.push(`${control.switchPositions.length} positions`);
                        }

                        return (
                            <TableRow key={index}>
                                <TableCell className="font-medium py-2">
                                    {getControlTypeLabel(control.type)}
                                </TableCell>
                                <TableCell className="py-2">{control.usage}</TableCell>
                                <TableCell className="py-2">
                                    {details.length > 0 ? (
                                        <div className="space-y-1">
                                            {details.map((detail, i) => (
                                                <div key={i} className="text-sm">{detail}</div>
                                            ))}
                                            {control.switchPositions &&
                                                control.switchPositions.length > 0 && (
                                                    <div className="mt-1 pt-1 border-t">
                                                        <div className="text-xs font-semibold mb-0.5">
                                                            Positions:
                                                        </div>
                                                        {control.switchPositions.map(
                                                            (pos, posIndex) => (
                                                                <div
                                                                    key={posIndex}
                                                                    className="text-xs"
                                                                >
                                                                    <span className="font-medium">
                                                                        {pos.position}:
                                                                    </span>{' '}
                                                                    {pos.description}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

