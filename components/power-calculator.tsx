import { useState } from 'react';
import React from 'react';

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const PowerCalculator = () => {
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState<number | null>(null);
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
      const powerCalc = ((voltageNum + voltageDrop) ** 2) / resistance;
      setPower(powerCalc);
    } else {
      setPower(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4 items-start mt-4">
            <div className="flex flex-col w-1/2">
              <label htmlFor="voltage" className='font-bold mb-2'>Voltage (V):</label>
              <Input 
                id="voltage"
                name="voltage"
                type="text" 
                placeholder="Voltage (V)" 
                value={voltage} 
                onChange={(e) => setVoltage(e.target.value)} 
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="rf-band" className='font-bold mb-2'>
                <span className='hidden md:inline'>Frequency</span> Band:</label>
              <Select value={band} onValueChange={(value) => {
                setBand(value);
              }}>
                <SelectTrigger id="rf-band" name="rf-band">
                  <SelectValue placeholder="Select Band">{band}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="180-10m">180-10m</SelectItem>
                  <SelectItem value="6m">6m</SelectItem>
                  <SelectItem value="2m">2m</SelectItem>
                  <SelectItem value="70cm">70cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCalculate}>Calculate Power</Button>
          {power !== null && (
            <div className="mt-4">
              <p><b>Power Output:</b> {power.toFixed(2)} Watts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerCalculator;