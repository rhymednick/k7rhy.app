/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {ArrowUpToLine} from "lucide-react"

import { DocProcedure, DocProcedureProps } from "@/components/doc/doc-procedure"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DocImage } from '@/components/doc/doc-image';  
import Link from "next/link"
const DocTitle = '20W Dummy Load Kit Assembly Guide';
const DocSubTitle = 'How to assemble and use the K7RHY 20W Dummy Load Kit.';

const breadcrumbItems = [
  { href: '/docs', label: 'Docs' },
  { label: DocTitle }
];

const inventoryTableItems = [
  { count: 1, text: 'Printed circuit board (PCB)', image: '/images/dl20w_bnc/guide/pcb.jpg', triggerImageSize: 200, popupImageSize: 1000 },
  { count: 8, text: '100 Ohm resistors', image: '/images/dl20w_bnc/guide/resistors.jpg', triggerImageSize: 200, popupImageSize: 1000 },
  { count: 1, text: 'Shottky diode', image: '/images/dl20w_bnc/guide/diode.jpg', triggerImageSize: 200, popupImageSize: 1000 },
  { count: 1, text: 'Ceramic capacitor', image: '/images/dl20w_bnc/guide/capacitor.jpg', triggerImageSize: 200, popupImageSize: 1000 },
  { count: 1, text: 'BNC connector', image: '/images/dl20w_bnc/guide/bnc.jpg', triggerImageSize: 200, popupImageSize: 1000 },
];

function buildInventoryTable() {
  return (
    <div>
      <Table>
        <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'>Count</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Image</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryTableItems.map((item, index) => (
            <TableRow key={index}>
                <TableCell className="font-medium text-center" >{item.count}</TableCell>
                <TableCell className="font-medium" >{item.text}</TableCell>
                <TableCell >
                  <DocImage 
                    title="Printed circuit board" 
                    triggerImageSize={item.triggerImageSize} 
                    popupImageSize={item.popupImageSize} 
                    src={item.image} 
                    alt={item.text} />
                </TableCell>
            </TableRow>
          ))}
                    
        </TableBody>
      </Table>
      <div>
        If anything in your kit is missing or damaged, please contact me at <Link className="no-underline hover:underline" href="mailto:de.k7rhy@gmail.com">de.k7rhy@gmail.com</Link>. I will send you a replacement part.
      </div>
    </div>
  );
}
const docProcedureSteps: DocProcedureProps['docProcedureSteps'] = [
  {
    text: 'Prepare your workspace',
    description: 'Find a clean, well-lit area to work. Collect your kit components and tools. You will need the following:',
    children: (
      <ul className='list-disc ml-8'>
        <li>Soldering iron</li>
        <li>Flux-core solder, or solder and solder paste</li>
        <li>Small wire cutters</li>
        <li>Needle-nose pliers (optional)</li>
        <li>Multimeter for testing (optional)</li>
        <li>Helping hands, or similar device, to hold the components while they're being soldered</li>
      </ul>
    )
  },
  {
    text: 'Inventory the parts',
    description: 'Open your project bag and verify that all of the components are there. You will have the following:',
    children: (
      buildInventoryTable()
    ),
    
  },
  {
    text: 'Prepare and install the reistors',
    description: 
      "Install the resistors on the PCB at the locations marked R1-R8. All of the resistors are identical," +
      " so they can go in any of the marked spaces; orientation isn't important since the resistors are not polarized. " + 
      "If you're experienced with electronics, you can install all of the resistors on your own now. " + 
      "If you're new to soldering, follow along with my instructions.",
    substeps: [
      {
        text: 'Prepare the resistor leads',
        description: 'Bend the leads of the resistor so that they are at a 90-degree angle to the body of the resistor. This will make it easier to install the resistor on the PCB. Use the PCB as a guide to determine the correct lead spacing.',
        image: '/images/dl20w_bnc/guide/insert-resistor.jpg',
      },
      {
        text: 'Insert resistors R1-R4',
        description: 'Insert the first four resistors into the PCB at the location marked R1-R4. The resistor can go in either way; there is no polarity to worry about. Once installed, bend the leads outward slightly to hold the resistors in place. The resistors should be flush with the PCB and on the printed side of the board.',
        image: '/images/dl20w_bnc/guide/bend-back.jpg',
      },
      {
        text: 'Solder the resistors',
        description: 'Hold the soldering iron to the pad and the lead of the resistor on the back of the PCB. Touch the solder to the joint, not the iron. The solder will flow onto the pad and the lead. Remove the solder first, then the iron. The joint should be shiny and smooth. Repeat this process for all of the resistors.',
        image: '/images/dl20w_bnc/guide/four-at-a-time.jpg',
      },
      {
        text: 'Trim the leads',
        description: 'Use the wire cutters to trim the excess leads from the resistor. ',
        image: '/images/dl20w_bnc/guide/trim-resistors.jpg',
      },
      {
        text: 'Repeat for the remaining resistors',
        description: 'Repeat the above steps for the remaining resistors, installing them at the locations marked R5-R8.',
        image: '/images/dl20w_bnc/guide/eight-top.jpg',
      },
    ],
  },
  {
    text: 'Install the capacitor and diode',
    description: 'Install the components at the locations marked C1 and D1 on the PCB and solder them in place. Trim the leads after soldering.',
    substeps: [
      {
        text: 'Install the capacitor',
        description: 'Insert the capacitor into the PCB at the location marked C1. The capacitor is not polarized, so it may be installed in any orientation. ',
        image: '/images/dl20w_bnc/guide/cap-installed.jpg',
      },
      {
        text: 'Install the diode',
        description: 'Insert the diode into the PCB at the location marked D1. The diode has polarity, so it must be installed in the correct orientation. Match the black line on the diode with the white line on the PCB silkscreen. Position the diode with the black line closest to the edge of the board, facing away from the resistors.',
        image: '/images/dl20w_bnc/guide/diode-installed.jpg',
      },
    ],
  },
  {
    text: 'Install the BNC connector',
    description: 'The installation of the BNC connector is tricky because of the alignment of the leads. Follow these steps carefully to ensure a good connection.',
    substeps: [
      {
        text: 'Prepare the BNC connector',
        description: 'Bend the leads of the BNC connector back roughly 30 degrees. This will make it easier to install the connector on the PCB.',
        image: '/images/dl20w_bnc/guide/bend-back-wires.jpg',
      },
      {
        text: 'Insert the BNC connector into the PCB',
        description: 'Begin by inserting the leads of the BNC connector into the PCB at an angle into the location marked J1. They are very short, so starting this way will make sure that everything is aligned correctly. Once aligned, press the connector down flat on the PCB. It will fit snugly.',
        image: '/images/dl20w_bnc/guide/insert-bnc-at-angle.jpg',
      },
      {
        text: 'Solder the BNC connector',
        description: 'Begin by soldering one of the mounting posts of the BNC connector. Hold the soldering iron to the pad and the post of the BNC connector on the back of the PCB to heat it up, and apply solder. The posts are thick, so they will take a little longer to heat up. The posts are not connected to the circuit and are only for mechanical support. Once the posts are soldered, solder the connector leads. The leads will not need to be trimmed.',
        image: '/images/dl20w_bnc/guide/secure-bnc.jpg',
      },
      {
        text: 'Appreciate your work',
        description: 'The assembly stage is complete. Take a step back and appreciate your work before moving on to testing.',
        image: '/images/dl20w_bnc/guide/all-installed.jpg',
      },
    ],
  },
  {
    text: 'Verify the build',
    description: 'Before connecting the device to your radio, perform a final inspection of the assembly.',
    substeps: [
      {
        text: 'Check for missing parts',
        description: 'Confirm that all the components are installed correctly and that no parts are missing. Aside from TP1 and TP2, there should be no marked areas of the board that do not have an attached component. There should be no empty holes on the board.',
        image: '/images/dl20w_bnc/guide/all-installed.jpg',
      },
      {
        text: 'Inspect solder joints',
        description: 'Inspect all solder joints to ensure that they are shiny and smooth. If not shiny, apply your soldering iron to the joint to reflow the solder. There should be no solder bridges between adjacent pads, and no solder balls should be present on the board.',
        image: '/images/dl20w_bnc/guide/check-solder.jpg',
      },
      {
        text: 'Verify resistance',
        description: 'Using a multimeter, measure the resistance between the two leads on the back of the BNC connector where it connects to the circuit board. The resistance should measure between 47.5 and 52.5 Ohms.',
        image: '/images/dl20w_bnc/guide/resistance-measurement.jpg',
      },
      {
        text: 'Check diode orientation',
        description: 'Verify that the black line on the diode matches the white line on the PCB silkscreen. The diode should be oriented with the black line closest to the edge of the board facing away from the resistors.',
        image: '/images/dl20w_bnc/guide/diode-installed.jpg',
      },
    ],
  },

  
];

const docProcedure: DocProcedureProps = {
  title: 'Assembly Procedure',
  docProcedureSteps: docProcedureSteps,
};


const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
      <div className='text-med text-muted-foreground mt-2 mb-6'>
        <div className="flex pt-2 pb-2 items-center space-x-2 bg-slate-100">
          <div className='ml-2 mr-2 md:mr-4'>In this topic:</div>
          
          <div>
            <Link href="#assembly_instructions">
              Assembly Instructions
            </Link>
          </div>
          <Separator orientation="vertical" />
          <div>
            <Link href="#operating_instructions">
              Operating Instructions
            </Link>
          </div>
        </div>
      </div>
      <div id="#assembly_instructions" /> 
      <DocProcedure {...docProcedure} />
      
      <h2 id="operating_instructions" className={cn("flex items-center text-2xl font-bold tracking-tight")}>
        <div>Operating Instructions</div> 
        <div className='ml-4'>
          <Link href="#top" >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><ArrowUpToLine /></TooltipTrigger>
                <TooltipContent>Back to top</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        </div>
      </h2>
      <div className='mt-2 md:mt-4'>
        A dummy load is a device used to simulate an electrical load. In amateur radio, 
        this allows you to safely test and calibrate equipment without broadcasting signals. 
        This dummy load is a resistor array designed to dissipate power without radiating radio 
        frequency (RF) signals. It is rated for 20 watts of power (continuous operation), but it can handle more for short
        periods. 
      </div>
      <div className='mt-2 md:mt-4'>
        To use the dummy load, connect it to your radio's antenna port using a BNC cable or BNC 
        cable adapter. The first time you use it, start with low power and verify that the dummy 
        load is working correctly. You will know it's working correctly because the SWR will stay
        under 1.5 for HF frequencies. 
      </div>

      <div className='mt-2 md:mt-4'>
        The dummy load has components and test pads that allow you to measure the power being 
        transmitted by your radio. For more information, 
        see <Link className="no-underline hover:underline" href='/docs/power-measurement'>Measuring Power</Link>. 
      </div>

      <h3 className={cn("text-xl font-bold tracking-tight mt-3 md:mt-6")}>Precautions</h3>
      <div className='mt-2 md:mt-4'>
        Energy is dissipated as heat in the resistors. Therefore, the dummy load will get hot during use. 
        The more energy you put into it, the hotter it will get. Keep this in mind and do not touch the 
        dummy load while it is in use. Allow it to cool before handling it.
      </div>

      <div className='mt-2 md:mt-4'>
        If mounting the dummy load in an enclosure, ensure that the enclosure is well-ventilated.
      </div>
    </DocPage>
  );
};

export default Page;