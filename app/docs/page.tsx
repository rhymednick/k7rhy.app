import React from 'react';

import { DocPage } from "@/components/doc/doc-page"
import { DocIndexCard, DocIndexItemType, DocIndexCardProps } from '@/components/doc/doc-index-card';


const DocTitle = 'Documentation';

const docAssemblyGuideProps: DocIndexCardProps = {
  title: 'Assembly Guides',
  description: 'Collection of assembly guides for the K7RHY ham radio kits.',
  items: [
    {
      title: '20W Dummy Load',
      href: '/docs/dl20w_bnc',
      description: 'How to assemble the 20W Dummy Load Kit.',
      type: DocIndexItemType.Internal,
    },
  ],
};
const docTechGuideProps: DocIndexCardProps = {
  title: 'Technical Information',
  description: 'Background technical information related to the operation of the K7RHY ham radio kits.',
  items: [
    {
      title: 'Measuring Power',
      href: '/docs/power_measurement',
      description: 'How to measure RF power using a multimeter on dummy load kits.',
      type: DocIndexItemType.Internal,
    },
  ],
};

export default async function Page() {

  return (
    <DocPage title={DocTitle} >
      <DocIndexCard {...docAssemblyGuideProps} />
      <DocIndexCard {...docTechGuideProps} />
    </DocPage>
  )
}