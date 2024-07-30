/* eslint-disable react/no-unescaped-entities */
"use client"
import React from 'react';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';

const DocTitle = 'Measuring Power';
const DocSubTitle = 'How to measure RF power using a multimeter on dummy load kits and understanding the electronics theory behind it.';
import { cn } from "@/lib/utils"
import PowerCalculator from '@/components/PowerCalculator';

const breadcrumbItems = [
  { href: '/docs', label: 'Docs' },
  { label: DocTitle }
];


const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
      <h2 className={cn("text-2xl font-bold tracking-tight mt-6")}>Power Calculator Tool</h2>
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
      <h2  className={cn("text-2xl font-bold tracking-tight mt-6")}>Background</h2>
      <div>When I get around to it, this is where I'll explain the theory behind the math.</div>

      <h2  className={cn("text-2xl font-bold tracking-tight mt-6")}>Computing the Power</h2>
      <div>When I get around to it, this is where I explain my interpretation of the theory and my changes to the power calculation.</div>
    </DocPage>
  );
};

export default Page;