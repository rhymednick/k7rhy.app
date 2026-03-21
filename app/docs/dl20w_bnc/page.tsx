/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';
import { ArrowUpDown } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DocImage } from '@/components/doc/doc-image';
import Link from 'next/link';
import { DocSection } from '@/components/doc/doc-section';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
const DocTitle = '20W Dummy Load Kit Assembly Guide';
const DocSubTitle = 'How to assemble and use the K7RHY 20W Dummy Load Kit.';

const breadcrumbItems = [{ href: '/docs', label: 'Docs' }, { label: DocTitle }];

const inventoryTableItems = [
    {
        count: 1,
        text: 'Printed circuit board (PCB)',
        image: '/images/dl20w_bnc/guide/pcb.jpg',
        triggerImageSize: 200,
        popupImageSize: 1000,
    },
    {
        count: 8,
        text: '100 Ohm resistors',
        image: '/images/dl20w_bnc/guide/resistors.jpg',
        triggerImageSize: 200,
        popupImageSize: 1000,
    },
    {
        count: 1,
        text: 'Shottky diode',
        image: '/images/dl20w_bnc/guide/diode.jpg',
        triggerImageSize: 200,
        popupImageSize: 1000,
    },
    {
        count: 1,
        text: 'Ceramic capacitor',
        image: '/images/dl20w_bnc/guide/capacitor.jpg',
        triggerImageSize: 200,
        popupImageSize: 1000,
    },
    {
        count: 1,
        text: 'BNC connector',
        image: '/images/dl20w_bnc/guide/bnc.jpg',
        triggerImageSize: 200,
        popupImageSize: 1000,
    },
];

function buildInventoryTable() {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Count</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Image</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventoryTableItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium text-center">{item.count}</TableCell>
                            <TableCell className="font-medium">{item.text}</TableCell>
                            <TableCell>
                                <DocImage title="Printed circuit board" triggerImageSize={item.triggerImageSize} popupImageSize={item.popupImageSize} src={item.image} alt={item.text} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div>
                If anything in your kit is missing or damaged, please contact me at{' '}
                <Link className="no-underline hover:underline" href="mailto:de.k7rhy@gmail.com">
                    de.k7rhy@gmail.com
                </Link>
                . I will send you a replacement part.
            </div>
        </div>
    );
}

const Page = () => {
    return (
        <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
            {/* <div className='text-med text-muted-foreground mt-2 mb-6'>
        <div className="flex pt-2 pb-2 items-center space-x-2 bg-slate-100 border border-slate-300 rounded-lg overflow-hidden">
          <div className='ml-4 mr-4'>In this topic:</div>

          <div>
            <Link href="#assembly_instructions">
              Assembly Instructions
            </Link>
          </div>
          <div className='text-slate-300 max-sm:hidden '>|</div>
          <div>
            <Link href="#operating_instructions">
              Operating Instructions
            </Link>
          </div>
        </div>
      </div> */}
            <div id="#assembly_instructions" />
            <DocSection title="Operating Instructions" bookmarkId="operating_instructions">
                <div>A dummy load is a device used to simulate an electrical load (like an antenna). In amateur radio, this allows you to safely test and calibrate equipment without broadcasting signals. This dummy load is a resistor array designed to dissipate power without radiating radio frequency (RF) signals. It is rated for 20 watts of power (continuous operation), but it can handle more for short periods.</div>
                <div className="mt-2">To use the dummy load, connect it to your radio's antenna port using a BNC cable or BNC cable adapter. The first time you use it, start with low power and verify that the dummy load is working correctly. You will know it's working correctly because the SWR will stay under 1.5 for HF frequencies.</div>

                <div className="mt-2">
                    The dummy load has components and test pads that allow you to measure the power being transmitted by your radio. For more information, see{' '}
                    <Link className="no-underline hover:underline font-bold" href="/docs/power_measurement">
                        Measuring Power
                    </Link>
                    .
                </div>

                <DocSection title="Precautions">
                    <div className="mt-2">Energy is dissipated as heat in the resistors. Therefore, the dummy load will get hot during use. The more energy you put into it, the hotter it will get. Keep this in mind and do not touch the dummy load while it is in use. Allow it to cool before handling it.</div>

                    <div className="mt-2">If mounting the dummy load in an enclosure, ensure that the enclosure is well-ventilated.</div>
                </DocSection>
            </DocSection>
        </DocPage>
    );
};

export default Page;
