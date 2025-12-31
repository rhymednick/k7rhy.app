'use client';
/**
 * The DocSection component is used to render a section with a heading and arbitrary content.
 * @component DocSection
 * @param {DocSectionProps} props - The properties for the DocSection component.
 * @returns {JSX.Element} The rendered DocSection component.
 */

import React, { createContext, useContext } from 'react';
import config, { DocSectionFormat } from '@/config/doc-section.config';

/**
 * The DocSectionProps interface represents the properties for the DocSection component.
 * @property {string} title - The section heading text.
 * @property {string} className - (Optional) The additional CSS class info for the section in tailwindcss format.
 * @property {React.ReactNode} children - (Optional) The content of the section.
 * @interface DocSectionProps
 */
export interface DocSectionProps {
    title: string;
    bookmarkId?: string;
    className?: string;
    children?: React.ReactNode;
}

// The SectionDepthContext is used to keep track of the current depth of the section and
// render the appropriate heading level for the context. Top-level sections are rendered with
// an H1, second-level sections with an H2, and so on.
const SectionDepthContext = createContext<number>(1);

function generateSectionHeading(headingLevel: number, title: string, bookmarkId?: string): React.ReactElement {
    headingLevel = Math.min(headingLevel, 6);
    const level = 'h' + headingLevel;
    const style = config.docSectionFormats.find((item: DocSectionFormat) => item.level === headingLevel)?.style;
    if (!style) {
        throw new Error(`Heading style not found for level ${headingLevel}`);
    }

    return React.createElement(level, { className: style, id: bookmarkId }, title);
}

export function DocSection(props: DocSectionProps) {
    const currentDepth = useContext(SectionDepthContext);

    return (
        <div className={props.className}>
            {generateSectionHeading(currentDepth, props.title)}
            {/* Increase the heading depth for child sections */}
            <SectionDepthContext.Provider value={currentDepth + 1}>{props.children}</SectionDepthContext.Provider>
        </div>
    );
}
