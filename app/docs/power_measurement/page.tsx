/* eslint-disable react/no-unescaped-entities */
"use client"
import React from 'react';
import 'katex/dist/katex.min.css';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { DocProcedure, DocProcedureProps } from "@/components/doc/doc-procedure"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import Image from 'next/image';
import PowerCalculatorSheet from '@/components/power-calculator-sheet';

const DocTitle = 'Measuring Power';
const DocSubTitle = 'How to measure RF power using a multimeter on dummy load kits and understanding how to apply the electronics theory behind it.';

const breadcrumbItems = [
  { href: '/docs', label: 'Docs' },
  { label: DocTitle }
];

const docProcedureSteps: DocProcedureProps['docProcedureSteps'] = [
  {
    text: 'Configure your multimeter',
    description: 'Set your multimeter to measure DC voltage. If you keep your transmitted power below 20W,' +
      ' you will not exceed 35V. Verify that your multimeter is set to read in the correct voltage range.',
  },
  {
    text: 'Attach the transmitter',
    description: 
      "Connect your transmitter output to the RF connector on the dummy load. For the most accurate measurement, keep the patch cable short.",
  },
  {
    text: 'Connect the multimeter',
    description: "Connect to the multimeter probes to the test pads (TP1 and TP2) on the dummy load. " +
    "They can be held in place by hand if you don't have aligator clips. The polarity of the probes does not matter. " +
    "The mathematical conversion will always return a positive power value whether the measured voltage is positive or negative.",
  },
  {
    text: 'Transmit a signal and measure the voltage',
    description: 'Transmit a signal from your radio and measure the voltage on the multimeter. The voltage may take a few seconds to stabilize. ',
  },
  {
    text: 'Convert the voltage to power',
    description: '',
    children: (
      <div className='-mt-2'>
        Using the <PowerCalculatorSheet /> below, 
        enter the voltage you measured and your transmission band, and the tool will calculate the power in watts.
      </div>
    )
  },

  
];

const docProcedure: DocProcedureProps = {
  title: 'Measurement Procedure',
  docProcedureSteps: docProcedureSteps,
};

const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
      <div>
        All K7RHY dummy load kits are designed with test pads that are used measure the output power  
        of your radio with a multimeter. The power is measured, while transmitting, as a voltage that is 
        converted to watts using a formula derived from Ohm's Law. 
      </div>

      <div className='flex justify-center mr-5 md:mr-20'>  
        <div className='mt-4 mb-4 border border-slate-300 shadow-lg rounded-lg inline-block'>
          <div className='overflow-hidden rounded-lg'>
            <Image src="/images/dl20w_bnc/guide/test-pads.jpg" alt="Reading the Voltage" title="Power Probe" width={500} height={500} />
          </div>
        </div>
      </div>
      
      <DocProcedure {...docProcedure} />

      <h2 className='text-2xl font-bold tracking-tight mb-2 mt-3 md:mt-6'>Understanding the Power Calculation</h2>
      <div>Power is calculated according to Ohm's Law, which states that power is equal to the 
        square of the voltage divided by the resistance.</div>

      <div>
        <BlockMath math="P = \frac{V^2}{R}" />
      </div>
      You'd be forgiven for thinking that the resistance is equal to the value of the dummy load's resistor network,
       but it's not. The resistance in this formula is the impedance of the dummy load, which is a combination of 
      resistance and reactance. The reactance changes with the frequency, based on the composition and construction
      of the dummy load and it's component parts. At HF frequencies the reactance is negligible, but that's not the case at VHF and UHF frequencies.
       To illustrate this point, the following table shows the measured impedance of a dummy load at various frequencies.
        For reference, the resistance of this dummy load was measured at <b>49.3 ohms</b> by a multimeter at the RF connector.
      <div className="flex justify-center mb-2 mt-2 md:mb-4 md:mt-4">
        <div className="flex flex-col md:flex-row  md:space-x-8">
          <div className="w-[225px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Impedance</TableHead>
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
          <div className='hidden md:block'>
            <Separator orientation="vertical" />
          </div>
          <div className='block md:hidden my-4'>
            <Separator orientation="horizontal" />
          </div>
          <div className="w-[225px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Impedance</TableHead>
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
       at the RF connector. For HF frequencies, we can make a reasonably accurate calculation of 
       power if we <b>set R to 25 ohms</b>.  
      </div>
      <div>
      We're close to being able to rewrite the formula for this dummy load specifically, but we need to make one more
      adjustment. The voltage that we measure is on the other side of a diode from the voltage source, 
      so we need to adjust for the voltage drop across the diode. Based on the diode specs, we 
      approximate this to be <b>0.3 volts</b>. Our modified formula for power is:
      </div>
      <div>
        <BlockMath math="P = \frac{(V+0.3)^2}{25}" />
      </div>
      <div>This is the equation used by the <PowerCalculatorSheet />
         for HF frequencies. When you select a different band, it adjusts 
      the resistance variable based on lab-measured averages for this dummy load kit.</div>

      <div className='mt-2 md:mt-4'>
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
              efficiency, which itself varies with frequency. Once leaving the transmitter, the power is further attenuated by the feedline 
              (including insertion losses), the load, and the 
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