import { defineCollection, defineConfig } from '@content-collections/core';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { z } from 'zod';
import crypto from 'crypto';

const blogSchema = z.object({
    title: z.string(),
    date: z.string().date('Invalid date string in blog entry.'),
    summary: z.string().optional().default(''), // Ensure summary defaults to an empty string
    tags: z.array(z.string()).optional(),
    publish: z.boolean().optional().default(false),
    wordCount: z.number().optional().default(0),
    readingTime: z.number().optional().default(0),
    isAISummary: z.boolean().optional().default(false), // Track AI-generated summaries
    content: z.string(), // Explicit content property for markdown content
});

const CACHE_DIR = join(process.cwd(), '.content-collections', 'cache');
const CACHE_FILE = join(CACHE_DIR, 'ai-summary.json');

function getCache() {
    // Allow clearing cache via environment variable
    if (process.env.CLEAR_AI_SUMMARY_CACHE === 'true') {
        if (existsSync(CACHE_FILE)) {
            console.log('Clearing AI summary cache (CLEAR_AI_SUMMARY_CACHE=true)');
            try {
                writeFileSync(CACHE_FILE, '{}');
            } catch (error) {
                console.warn('Failed to clear cache file:', error);
            }
        }
        return {};
    }

    if (!existsSync(CACHE_FILE)) return {};
    try {
        return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveCache(cache: any) {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const blog = defineCollection({
    name: 'blog',
    directory: 'content/blog',
    include: '**/*.mdx',
    schema: blogSchema,
    transform: async (data, context) => {
        console.log(`Starting transformation for: ${data.title}`);

        const contentFilePath = join(process.cwd(), 'content', 'blog', data._meta.fileName);

        try {
            const content = readFileSync(contentFilePath, 'utf8');
            console.log(`Content read successfully for: ${data.title}`);

            const contentWithoutFrontMatter = content.replace(/---\s*[\s\S]*?\s*---/, '').trim();

            // Strip JSX components for AI summary generation
            // This removes JSX tags and their content, keeping only plain text
            const stripJSX = (text: string): string => {
                // Remove JSX components (handles both self-closing and with children)
                // This regex matches JSX tags and their content recursively
                let result = text;
                let previousResult = '';

                // Keep removing JSX until no more changes occur
                while (result !== previousResult) {
                    previousResult = result;
                    // Remove JSX components with children (handles nested components)
                    result = result.replace(/<[A-Z][a-zA-Z0-9]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '');
                    // Remove self-closing JSX components
                    result = result.replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '');
                    // Remove JSX fragments
                    result = result.replace(/<>[\s\S]*?<\/>/g, '');
                }

                // Clean up any remaining JSX syntax artifacts
                result = result.replace(/<[^>]+>/g, '');

                return result.trim();
            };

            const plainTextContent = stripJSX(contentWithoutFrontMatter);
            const wordCount = contentWithoutFrontMatter.split(/\s+/).length;
            const wordsPerMinute = 200;
            const readingTime = Math.ceil(wordCount / wordsPerMinute);

            console.log(`Word count: ${wordCount}, Reading time: ${readingTime} for: ${data.title}`);

            // AI Summary generation logic
            let summary = data.summary?.trim() || ''; // Trim the summary to catch any empty string
            let isAISummary = false;

            if (!summary) {
                const cache = getCache();
                const contentHash = crypto.createHash('md5').update(plainTextContent).digest('hex');
                const cacheKey = `${data._meta.fileName}:${contentHash}`;

                // Check for exact match first
                if (cache[cacheKey] && cache[cacheKey].trim()) {
                    console.log(`Using cached summary for: ${data.title}`);
                    summary = cache[cacheKey];
                    isAISummary = true;
                } else {
                    // Check if there's an old cache entry for this file (content may have changed)
                    const oldCacheKey = Object.keys(cache).find(key => key.startsWith(`${data._meta.fileName}:`));
                    if (oldCacheKey) {
                        console.log(`Found old cache entry for ${data.title} (content hash changed), generating new summary...`);
                    } else {
                        console.log(`No summary found, generating AI summary for: ${data.title}`);
                    }

                    try {
                        if (!process.env.HUGGING_FACE_API_TOKEN) {
                            console.warn(`Skipping AI summary generation for ${data.title}: HUGGING_FACE_API_TOKEN is not set`);
                            summary = '';
                        } else {
                            // Truncate content to ~800 words to stay within model limits (distilbart-cnn-12-6 has ~1024 token limit)
                            // Approximate: 1 word ≈ 1.3 tokens, so 800 words ≈ 1040 tokens (safe margin)
                            const words = plainTextContent.split(/\s+/);
                            const maxWords = 800;
                            const truncatedContent = words.length > maxWords 
                                ? words.slice(0, maxWords).join(' ') 
                                : plainTextContent;

                            if (words.length > maxWords) {
                                console.log(`Content truncated from ${words.length} to ${maxWords} words for AI summary generation`);
                            }

                            const response = await axios.post(
                                'https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6',
                                { inputs: truncatedContent },
                                {
                                    headers: {
                                        Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
                                        'Content-Type': 'application/json',
                                    },
                                    timeout: 30000, // 30 second timeout
                                }
                            );

                            if (response.data && Array.isArray(response.data) && response.data[0]?.summary_text) {
                                summary = response.data[0].summary_text;
                                isAISummary = true;
                                console.log(`AI summary generated successfully for: ${data.title}`);

                                // Update cache
                                cache[cacheKey] = summary;
                                saveCache(cache);
                            } else {
                                console.warn(`Unexpected response format from AI summary API for: ${data.title}`, response.data);
                                summary = '';
                            }
                        }
                    } catch (error: any) {
                        // More detailed error logging
                        if (error.response) {
                            console.error(`AI summary API error for ${data.title}: ${error.response.status} ${error.response.statusText}`, error.response.data);
                        } else if (error.request) {
                            console.error(`AI summary API request failed for ${data.title}: No response received`, error.message);
                        } else {
                            console.error(`Error generating AI summary for ${data.title}:`, error.message);
                        }
                        
                        // Set empty summary on error (non-fatal)
                        summary = '';
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
