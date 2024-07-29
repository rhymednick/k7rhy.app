import React from 'react';
import { DocPage, MyBreadcrumbs } from '@/components/doc/doc-page';

const DocTitle = 'Measuring Power';
const DocSubTitle = 'How to measure RF power using a multimeter on dummy load kits.';

const breadcrumbItems = [
  { href: '/docs', label: 'Docs' },
  { label: DocTitle }
];


const Page=() => {
  return (
    <DocPage title={DocTitle} subTitle={DocSubTitle} breadcrumbs={<MyBreadcrumbs items={breadcrumbItems} />}>
      <h1>Hello, Next.js!</h1>
      <p>This is a simple TSX page.</p>

    </DocPage>
  );
};

export default Page;