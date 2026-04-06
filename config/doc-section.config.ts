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
            level: 1,
            style: 'text-4xl font-bold tracking-tight pb-3 mb-1 border-b border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100',
        },
        {
            level: 2,
            style: 'text-lg font-semibold tracking-tight mt-6 mb-1 text-gray-700 dark:text-slate-200',
        },
        {
            level: 3,
            style: 'text-base font-semibold tracking-tight mt-4 mb-1 text-gray-600 dark:text-slate-300',
        },
        {
            level: 4,
            style: 'text-sm font-semibold tracking-tight mt-3 text-gray-500 dark:text-slate-400',
        },
        {
            level: 5,
            style: 'text-sm font-medium tracking-tight mt-3 text-gray-500 dark:text-slate-400',
        },
        {
            level: 6,
            style: 'text-sm font-medium italic tracking-tight mt-3 text-gray-400 dark:text-slate-500',
        },
    ],
} as DocSectionConfig;
