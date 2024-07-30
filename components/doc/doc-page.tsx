import React from 'react';

import { Balancer } from "react-wrap-balancer"
import { cn } from "@/lib/utils"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

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
    const subTitle = props.subTitle ? <p className="text-base text-muted-foreground"><Balancer ratio={0.85} preferNative={false}>{props.subTitle}</Balancer></p> : null;
    const breadcrumbs = props.breadcrumbs ? <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">{props.breadcrumbs}</div> : null;
  return (
    <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div className="mx-auto w-full min-w-0">
            {breadcrumbs}
            <div className="space-y-2">
                <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                {props.title}
                </h1>
                {subTitle}
                <div className="max-w-[800px] justify-between ">
                    {props.children}
                </div>
            </div>
        </div>
    </main>
  )
}