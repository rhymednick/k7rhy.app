import { Meta } from '@content-collections/core';

export interface LinksProperties {
    doc?: string;
    api?: string;
}

export interface Doc {
    title: string;
    description: string;
    body: string;
    slug: string;
    published: boolean;
    links: LinksProperties[];
    featured?: boolean;
    component?: boolean;
    toc?: boolean;
}
