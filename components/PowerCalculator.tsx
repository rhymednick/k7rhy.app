import { useState } from 'react';
import React from 'react';

import {
    Card,
    CardContent,

  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PowerCalculator = () => {
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState<number | null>(null);

  const handleCalculate = () => {
    const resistance = 50; // Replace with the resistance of your dummy load in ohms
    const voltageNum = parseFloat(voltage);
    if (!isNaN(voltageNum)) {
      const powerCalc = (voltageNum ** 2) / resistance;
      setPower(powerCalc);
    } else {
      setPower(null);
    }
  };

  return (
    <Card>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className='mt-4 font-bold'>Enter your measured voltage:</div>
          <Input 
            type="text" 
            placeholder="Voltage (V)" 
            value={voltage} 
            onChange={(e) => setVoltage(e.target.value)} 
          />
          <Button onClick={handleCalculate}>Calculate Power</Button>
          {power !== null && (
            <div className="mt-4">
              <p>Power: {power.toFixed(2)} Watts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerCalculator;