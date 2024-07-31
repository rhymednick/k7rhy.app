/* eslint-disable react/no-unescaped-entities */
"use client"
import React from 'react';
import 'katex/dist/katex.min.css';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';

const DocTitle = 'Measuring Power';
const DocSubTitle = 'How to measure RF power using a multimeter on dummy load kits and understanding the electronics theory behind it.';
import { cn } from "@/lib/utils"
import PowerCalculator from '@/components/power-calculator';
import { BlockMath } from 'react-katex';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const breadcrumbItems = [
  { href: '/docs', label: 'Docs' },
  { label: DocTitle }
];


const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
      <h2 id="#power_calculator_tool" className={cn("text-2xl font-bold tracking-tight mt-6")}>Power Calculator Tool</h2>
      <div>
        If you're not interested in learning the theory or working the math by hand, I've got you.
        Enter your voltage measurement here and I'll tell you how much power your radio is transmitting
        into the dummy load.
      </div>
      <div className='container mx-auto p-4'>
        <div className='shadow-lg mr-20'>
          <PowerCalculator />
        </div>
      </div>
      <h2  className={cn("text-2xl font-bold tracking-tight mt-6")}>Computing the Power</h2>
      <div>Power is calculated according to Ohm's Law, which states that power is equal to the 
        square of the voltage divided by the resistance.</div>

      <div>
        <BlockMath math="P = \frac{V^2}{R}" />
      </div>
      You'd be forgiven for thinking that the resistance is equal to the value of the dummy load's resistor network,
       but it's not. The resistance in this formula is the impedance of the dummy load, which is a combination of 
      resistance and reactance. The reactance changes with the frequency, based on the composition and construction
      of the dummy load. At HF frequencies the reactance is negligible, but this is not the case at VHF and UHF frequencies.
       To illustrate this point, the following table shows the measured impedance of a dummy load at various frequencies.
        For reference, the resistance of this dummy load was measured at <b>49.3 ohms</b> by a multimeter.
      <div className="flex justify-center mt-4">
        <div className="flex flex-row space-x-8">
          <div className="w-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Impedance |Z|</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1.8 MHz</TableCell>
                  <TableCell>49.3 ohms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>14.2 MHz</TableCell>
                  <TableCell>49.5 ohms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>28.8 MHz</TableCell>
                  <TableCell>51.7 ohms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <Separator orientation="vertical" />

          <div className="w-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Impedance |Z|</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>52 MHz</TableCell>
                  <TableCell>57.1 ohms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>146 MHz</TableCell>
                  <TableCell>115 ohms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>435 MHz</TableCell>
                  <TableCell>63.6 ohms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className='mb-4'>
      The test pad on the dummy load that is used for measuring the voltage is connected to the center
       of the resistor network. Therefore, the impedance at that point is half the impedance measured 
       at the BNC connector. For HF frequencies, we can make a reasonably accurate calculation of 
       power if we set <b>R</b> to <b>25 ohms</b>.  
      </div>
      <div>
      We're close to being able to rewrite the formula for this dummy load, but we need to make one more
      adjustment. The voltage that we measure is on the other side of a diode from the voltage source, 
      so we need to adjust for the voltage drop across the diode. Based on the component specs, we 
      approximate this to be <b>0.3 volts</b>. Our modified formula for power is:
      </div>
      <div>
        <BlockMath math="P = \frac{(V+0.3)^2}{25}" />
      </div>
      <div>This is the equation used by the <Link className="no-underline hover:underline" href="#assembly_instructions">
      <b>Power Calculator Tool</b></Link> for HF frequencies. When you select a different band, it adjusts 
      the resistance variable based on lab-measured approximations for the dummy load kit.</div>

      <div className='mt-4'>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>About the use of approximations</AlertTitle>
          <AlertDescription>
            <div className='mt-2'>As an engineer and a perfectionist, I'm not a fan of approximations. In fact, I feel physical discomfort
            from suggesting that you use them. However, the goal of this project is to provide a practical 
            tool for hams to measure power. The approximations used in the tool are based on lab measurements of
            the exact hardware used in the kit you've been provided. The approximations are accurate enough for
            practical use. I could design a kit that would make computations based on real-time internal measurments, 
            but that kit would be prohibitively expensive and provide no additional operational value.</div>

            <div className='mt-2'>The bottom line is, radio transmitters do not transmit at precise, stable power levels across their 
              supported frequency range. The power output of a transmitter is a function of the input power and the component
              efficiency, which itself varies with frequency. Once leaving the transmitter, the power is further attenuated by the feedline, the load, and the 
              environment. For the purposes of ham radio, it's good to know that your transmitter is operating within a certain 
              range of its rated power, but there's little value in knowing the exact, momentary power output. 
            </div>

          </AlertDescription>
        </Alert>
      </div>
    
    </DocPage>
  );
};

export default Page;