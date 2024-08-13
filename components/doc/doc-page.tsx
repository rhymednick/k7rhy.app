"use client"
import React, { useEffect } from 'react';

import { Balancer } from "react-wrap-balancer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DocSection } from './doc-section';

interface DocPageProps {
  title: string
  subTitle?: string
  breadcrumbs?: React.JSX.Element
  children?: React.ReactNode
}

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

export function MyBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}


export function DocPage(props: DocPageProps) {
  const subTitle = props.subTitle ? <div className="-mt-4 mb-6 text-base text-muted-foreground"><Balancer ratio={0.85} preferNative={false}>{props.subTitle}</Balancer></div> : null;
  const breadcrumbs = props.breadcrumbs ? <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">{props.breadcrumbs}</div> : null;

  useEffect(() => {
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') || '';
      }
    });
  }, []);

  return (
    <main className="relative py-2 md:py-6 lg:gap-10 lg:py-8 ">
      <div className="mx-auto w-full min-w-0">
        {breadcrumbs}
        <div className="space-y-2">
          <DocSection title={props.title} className='scroll-m-20'>
            {subTitle}
            <div className="max-w-[800px] justify-between ">
              {props.children}
            </div>
          </DocSection>
        </div>
      </div>
    </main>
  )
}