import { defineCollection, defineConfig } from '@content-collections/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const blog = defineCollection({
    name: 'blog',
    directory: 'content/blog',
    include: '**/*.mdx',
    schema: (z) => ({
        title: z.string(),
        date: z.string().date('Invalid date string in blog entry.'),
        summary: z.string().optional().default(''), // Ensure summary defaults to an empty string
        tags: z.array(z.string()).optional(),
        publish: z.boolean().optional().default(false),
        wordCount: z.number().optional().default(0),
        readingTime: z.number().optional().default(0),
        isAISummary: z.boolean().optional().default(false), // Track AI-generated summaries
    }),
    transform: async (data, context) => {
        console.log(`Starting transformation for: ${data.title}`);

        const contentFilePath = join(
            process.cwd(),
            'content',
            'blog',
            data._meta.fileName
        );

        try {
            const content = readFileSync(contentFilePath, 'utf8');
            console.log(`Content read successfully for: ${data.title}`);

            const contentWithoutFrontMatter = content
                .replace(/---\s*[\s\S]*?\s*---/, '')
                .trim();
            const wordCount = contentWithoutFrontMatter.split(/\s+/).length;
            const wordsPerMinute = 200;
            const readingTime = Math.ceil(wordCount / wordsPerMinute);

            console.log(
                `Word count: ${wordCount}, Reading time: ${readingTime} for: ${data.title}`
            );

            // AI Summary generation logic
            let summary = data.summary?.trim() || ''; // Trim the summary to catch any empty string
            let isAISummary = false;

            if (!summary) {
                console.log(
                    `No summary found, generating AI summary for: ${data.title}`
                );
                try {
                    const response = await axios.post(
                        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
                        { inputs: contentWithoutFrontMatter },
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
                            },
                        }
                    );
                    summary =
                        response.data[0]?.summary_text ||
                        'AI summary generation failed';
                    isAISummary = true;
                    console.log(
                        `AI summary generated successfully for: ${data.title}`
                    );
                } catch (error) {
                    console.error(
                        `Error generating AI summary for file: ${contentFilePath}`,
                        error
                    );

                    if (error instanceof Error) {
                        summary =
                            process.env.NODE_ENV === 'development'
                                ? `AI summary generation failed: ${error.message}`
                                : '';
                    } else {
                        summary =
                            'AI summary generation failed due to an unknown error';
                    }
                }
            }

            return {
                ...data,
                wordCount,
                readingTime,
                summary, // summary is guaranteed to be a string
                isAISummary,
            };
        } catch (error) {
            console.error(`Error reading file: ${contentFilePath}`, error);
            return {
                ...data,
                wordCount: 0,
                readingTime: 0,
                summary: '', // Ensure summary is an empty string if there's an error
                isAISummary: false,
            };
        }
    },
});

export default defineConfig({
    collections: [blog],
});
