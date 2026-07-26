import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';
import { validateInstrumentDocument } from './lib/instruments/validation';

const instrumentSchema = z.object({
    publish: z.boolean().optional().default(false),
    name: z.string().min(1),
    completed: z.union([z.string().regex(/^\d{4}$/, 'Expected YYYY or YYYY-MM-DD.'), z.string().date('Invalid completion date.')]),
    dateLabel: z.string().min(1).optional(),
    origin: z.string().min(1),
    theme: z.string().min(1),
    images: z.array(
        z.object({
            src: z.string().min(1),
            alt: z.string().min(1),
        })
    ),
    related: z
        .object({
            label: z.string().min(1),
            href: z.string().startsWith('/'),
        })
        .optional(),
    content: z.string(),
});

const instruments = defineCollection({
    name: 'instruments',
    directory: 'content/instruments',
    include: '**/*.mdx',
    schema: instrumentSchema,
    transform: async (data) => ({ ...data, ...validateInstrumentDocument(data._meta.path, data) }),
});

export default defineConfig({
    collections: [instruments],
});
