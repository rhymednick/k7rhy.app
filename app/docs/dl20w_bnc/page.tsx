import React from 'react';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import Image from 'next/image'

import { DocProcedure, DocProcedureProps } from "@/components/doc/doc-procedure"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DocImage } from '@/components/doc/doc-image';  
const DocTitle = '20W Dummy Load (BNC) Kit Assembly Guide';
const DocSubTitle = 'How to assemble the 20W Dummy Load (BNC) kit.';

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
  );
}
const docProcedureSteps: DocProcedureProps['docProcedureSteps'] = [
  {
    text: 'Prepare your workspace',
    description: 'Gather all the components needed for the assembly, including the PCB, resistors, capacitors, and connectors.',
    children: (
      <p><b>Refer </b>to the diagram for resistor placement.</p>
    )
  },
  {
    text: 'Inventory the parts',
    description: 'Open your project bag and verify that all the components are present. You will have the following:',
    children: (
      buildInventoryTable()
    ),
    
  },
  {
    text: 'Prepare and install the reistors',
    description: 'Next, install the capacitors onto the PCB. Again, refer to the assembly guide for the correct capacitor values and orientations.',
  },
  {
    text: 'Install the capacitor and diode',
    description: 'Attach the connectors to the PCB, ensuring a secure and proper connection. Double-check the pin configurations to avoid any wiring mistakes.',
  },
  {
    text: 'Install the BNC connector',
    description: 'Once the',
  },
  {
    text: 'Verify the build',
    description: 'Before connecting the dummy load to your radio, perform a final inspection of the assembly.',
    substeps: [
      {
        text: 'Check for missing parts',
        description: 'Confirm that all the components are installed correctly and that no parts are missing. Aside from TP1 and TP2, there should be no marked areas of the board that do not have an attached component. There should be no empty holes on the board.',
      },
      {
        text: 'Inspect solder joints',
        description: 'Inspect all solder joints to ensure that they are shiny and smooth. There should be no solder bridges between adjacent pads, and no solder balls should be present on the board.',
      },
      {
        text: 'Verify resistance',
        description: 'Using a multimeter, measure the resistance between the two wires on the back of the BNC connector where it connects to the circuit board. The resistance should measure between 47.5 and 52.5 Ohms.',
      },
      {
        text: 'Check diode orientation',
        description: 'Verify that the black line on the diode matches the white line on the PCB silkscreen. The diode should be oriented with the black line closest to the edge of the board facing away from the resistors.',
      },
    ],
  },
  
];

const docProcedure: DocProcedureProps = {
  title: 'Assembly Instructions',
  docProcedureSteps: docProcedureSteps,
};


const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>

    <DocProcedure {...docProcedure} />
      

    </DocPage>
  );
};

export default Page;