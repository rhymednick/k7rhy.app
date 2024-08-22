/**
 * @fileoverview This file contains the configuration for the DocSection component.
 * @module config/doc-section.config
 */

/**
 * The DocSectionFormat interface represents the styling for a single section heading.
 * @property {number} level - The level of the heading.
 * @property {string} style - The CSS style for the heading.
 * @interface DocSectionFormat
 */
export interface DocSectionFormat {
    level: number;
    style: string;
}

/**
 * The DocSectionConfig interface represents the configuration for the DocSection component.
 * @property {DocSectionFormat[]} docSectionFormats - The styling for the section headings.
 * @interface DocSectionConfig
 */
export interface DocSectionConfig {
    docSectionFormats: DocSectionFormat[];
}

/**
 * The configuration object for the DocSection component.
 * @constant {DocSectionConfig}
 */
export default {
    docSectionFormats: [
        {
            level: 1, //H1
            style: 'text-3xl font-bold tracking-tight pb-2 md:pb-6',
        },
        {
            level: 2, //H2
            style: 'text-2xl font-bold tracking-tight pb-2 pt-2  text-slate-700',
        },
        {
            level: 3, //H3
            style: 'text-xl font-bold tracking-tight pt-2  text-slate-600',
        },
        {
            level: 4, //H4
            style: 'text-l font-bold tracking-tight pt-2 text-slate-500',
        },
        {
            level: 5, //H5
            style: 'text-l font-bold tracking-tight pt-2 text-slate-400',
        },
        {
            level: 6, //H6
            style: 'text-l font-bold italic tracking-tight pt-2 text-slate-400',
        },
    ],
} as DocSectionConfig;
