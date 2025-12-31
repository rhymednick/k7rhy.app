'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const PageNavigation = () => {
    const [headings, setHeadings] = useState<Element[]>([]);
    const pathname = usePathname(); // Get the current pathname

    useEffect(() => {
        const h2AndH3Elements = Array.from(document.querySelectorAll('h2, h3'));
        const filteredHeadings = h2AndH3Elements.filter((heading) => !heading.hasAttribute('exclude-from-page-nav') && !heading.classList.contains('no-nav'));
        setHeadings(filteredHeadings);
    }, [pathname]);

    // Adjust scroll position after navigation
    useEffect(() => {
        const handleHashChange = () => {
            const target = document.getElementById(window.location.hash.slice(1));
            if (target) {
                const offset = 50; // Adjust this value to match your fixed header height
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'auto',
                });
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Return null if no headings are found. Having an empty "on this page"
    // section is not useful in that case.
    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className="sticky top-20 right-2 hidden lg:block w-64 ml-1">
            <aside>
                <Accordion defaultValue="page-nav" type="single" collapsible>
                    <AccordionItem value="page-nav">
                        <AccordionTrigger className="font-bold hover:no-underline">On this page</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-2 p-4 ">
                                {headings.map((heading, index) => {
                                    const isH2 = heading.tagName === 'H2';
                                    return (
                                        <li key={index} className={`pl-${isH2 ? 0 : 4}`}>
                                            <a href={`#${heading.id}`} className={`text-sm font-medium ${isH2 ? 'dark:text-gray-500 text-gray-700 dark:hover:text-blue-400 hover:text-blue-600' : 'text-gray-500 hover:text-blue-400'}`}>
                                                {heading.textContent}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </aside>
        </nav>
    );
};
