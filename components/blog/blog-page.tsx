'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

import { DocSection } from '@/components/doc/doc-section';
import { formatDate } from '@/lib/utils';
interface BlogPageProps {
    title: string;
    date: string;
    tags?: string[];
    children?: React.ReactNode;
}

export function BlogPage(props: BlogPageProps) {
    //const subTitle = props.subTitle ? <div className="-mt-4 mb-6 text-base text-muted-foreground"><Balancer ratio={0.85} preferNative={false}>{props.subTitle}</Balancer></div> : null;

    useEffect(() => {
        const headings = document.querySelectorAll('h2, h3');
        headings.forEach((heading) => {
            if (!heading.id) {
                // eslint-disable-next-line no-useless-escape
                heading.id =
                    heading.textContent
                        ?.toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '') || '';
            }
        });
    }, []);

    return (
        <div className="overflow-hidden">
            <div className="max-w-8xl mx-auto">
                <div className="flex px-4 pt-8 pb-10 lg:px-8">
                    <Link className="group flex font-semibold text-sm leading-6 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" href="/blog">
                        <svg viewBox="0 -9 3 24" className="overflow-visible mr-3 text-slate-400 w-auto h-6 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                            <path d="M3 0L0 3L3 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        Back to Lab Notes
                    </Link>
                </div>
            </div>
            <div className="px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <main className="lg:gap-10 pb-8">
                        <article className="relative pt-10">
                            {/* <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200 md:text-3xl ">
                                {props.title}
                            </h1> */}
                            <div className="text-sm leading-6">
                                <dl>
                                    <dt className="sr-only">Date</dt>
                                    <dd className="absolute top-0 inset-x-0 text-slate-700 dark:text-slate-400">
                                        <time dateTime={new Date(props.date).toISOString()}>{formatDate(props.date)}</time>
                                    </dd>
                                </dl>
                            </div>
                            {/* this next element (commented out) is an example of how the tailwindcss site shows blog authors */}
                            {/* <div class="mt-6"><ul class="flex flex-wrap text-sm leading-6 -mt-6 -mx-5"><li class="flex items-center font-medium whitespace-nowrap px-5 mt-6"><img src="/_next/static/media/adamwathan.8adb7a70.jpg" alt="" class="mr-3 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800" decoding="async"><div class="text-sm leading-4"><div class="text-slate-900 dark:text-slate-200">Adam Wathan</div><div class="mt-1"><a href="https://twitter.com/adamwathan" class="text-sky-500 hover:text-sky-600 dark:text-sky-400">@adamwathan</a></div></div></li><li class="flex items-center font-medium whitespace-nowrap px-5 mt-6"><img src="/_next/static/media/reinink.dd880af3.jpg" alt="" class="mr-3 w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800" decoding="async"><div class="text-sm leading-4"><div class="text-slate-900 dark:text-slate-200">Jonathan Reinink</div><div class="mt-1"><a href="https://twitter.com/reinink" class="text-sky-500 hover:text-sky-600 dark:text-sky-400">@reinink</a></div></div></li></ul></div> */}
                            <DocSection title={props.title} className="scroll-m-20">
                                <div className="prose prose-slate dark:prose-dark">{props.children}</div>
                            </DocSection>
                        </article>
                    </main>
                </div>
            </div>
        </div>
    );
}
