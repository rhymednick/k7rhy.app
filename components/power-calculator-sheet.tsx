import { useState } from 'react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from './ui/label';

const PowerCalculatorSheet = () => {
    const [voltage, setVoltage] = useState('');
    const [power, setPower] = useState<number>(0);
    const [band, setBand] = useState('180-10m');

    const handleCalculate = () => {
        const resistanceValues: { [key: string]: number } = {
            '180-10m': 25,
            '6m': 29,
            '2m': 60,
            '70cm': 32,
        };

        const resistance = resistanceValues[band];
        const voltageDrop = 0.3;
        const voltageNum = parseFloat(voltage);
        if (!isNaN(voltageNum)) {
            const powerCalc = (voltageNum + voltageDrop) ** 2 / resistance;
            setPower(powerCalc);
        } else {
            //setPower(null);
            setPower(0);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="inline font-bold no-underline hover:underline">
                    Power Calculator Tool
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Power Calculator Tool</SheetTitle>
                    <SheetDescription>
                        Enter your measured voltage and frequency band to
                        calculate the output power.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 grid-4 mt-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                            htmlFor="voltage"
                            className="col-span-2 font-bold text-right"
                        >
                            Voltage (V):
                        </Label>
                        <Input
                            id="voltage"
                            name="voltage"
                            type="text"
                            placeholder="Voltage (V)"
                            className="col-span-2"
                            value={voltage}
                            onChange={(e) => setVoltage(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                            htmlFor="rf-band"
                            className="col-span-2 font-bold text-right"
                        >
                            Band:
                        </Label>
                        <div className="col-span-2">
                            <Select
                                value={band}
                                onValueChange={(value) => {
                                    setBand(value);
                                }}
                            >
                                <SelectTrigger
                                    id="rf-band"
                                    name="rf-band"
                                >
                                    <SelectValue placeholder="Select Band">
                                        {band}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="180-10m">
                                        180-10m
                                    </SelectItem>
                                    <SelectItem value="6m">6m</SelectItem>
                                    <SelectItem value="2m">2m</SelectItem>
                                    <SelectItem value="70cm">70cm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                            htmlFor="wattage"
                            className="col-span-2 font-bold text-right"
                        >
                            Power (W):
                        </Label>
                        <Label
                            htmlFor="wattage"
                            className="p-3 col-span-2 font-bold text-black bg-blue-200 overflow-hidden rounded-lg"
                        >
                            {power !== null && (
                                <div className="ml-1">{power.toFixed(1)}</div>
                            )}
                        </Label>
                    </div>

                    <Button onClick={handleCalculate}>Calculate Power</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
export default PowerCalculatorSheet;
