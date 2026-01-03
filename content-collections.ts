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

                    // Prepare content for AI processing (needed for both main attempt and fallback)
                    // Clean and normalize content for better model compatibility
                    // Remove excessive whitespace, normalize line breaks, and clean special characters
                    let cleanedContent = plainTextContent
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .replace(/\n+/g, ' ') // Replace line breaks with spaces
                        .trim();

                    // Truncate content to ~600 words to stay well within model limits
                    // distilbart-cnn-12-6 has ~1024 token limit, but we use 600 words (~780 tokens) for safety
                    // Some content may have more tokens per word due to special characters
                    const words = cleanedContent.split(/\s+/).filter(word => word.length > 0);
                    const maxWords = 600;
                    const truncatedContent = words.length > maxWords
                        ? words.slice(0, maxWords).join(' ')
                        : cleanedContent;

                    if (words.length > maxWords) {
                        console.log(`Content truncated from ${words.length} to ${maxWords} words for AI summary generation`);
                    }

                    // Additional safety: limit character length (some models have character limits too)
                    const maxChars = 4000;
                    const finalContent = truncatedContent.length > maxChars
                        ? truncatedContent.substring(0, maxChars).trim()
                        : truncatedContent;

                    if (truncatedContent.length > maxChars) {
                        console.log(`Content further truncated to ${maxChars} characters for AI summary generation`);
                    }

                    try {
                        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                            console.warn(`Skipping AI summary generation for ${data.title}: GOOGLE_GENERATIVE_AI_API_KEY is not set`);
                            summary = '';
                        } else {
                            const { GoogleGenerativeAI } = await import('@google/generative-ai');
                            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
                            const model = genAI.getGenerativeModel(
                                { model: 'gemma-3-27b-it' }
                            );

                            // Add a small randomized delay
                            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

                            const prompt = `You are writing a short summary for a blog index page.

The goal is not to restate the article, but to help a reader quickly decide whether this post is worth reading.

Write 2–3 sentences, plain language, no hype.

The summary must:
	•	Clearly state what problem, question, or idea the post addresses
	•	Indicate who the post is for (skill level, role, or mindset)
	•	Hint at what the reader will walk away understanding or able to do

The summary must not:
	•	Use marketing language, emojis, or buzzwords
	•	Include calls to action (“you’ll love,” “must-read,” etc.)
	•	Assume the reader agrees with the author

Write in a neutral, factual tone. The content is:
${finalContent}`;

                            console.log(`Generating Gemini summary for: ${data.title}`);

                            const result = await model.generateContent(prompt);
                            const response = await result.response;
                            const text = response.text().trim();

                            if (text) {
                                summary = text.replace(/\s+/g, ' ').trim();
                                isAISummary = true;
                                console.log(`AI description generated successfully for: ${data.title}`);

                                // Update cache
                                cache[cacheKey] = summary;
                                saveCache(cache);
                            } else {
                                console.warn(`Empty response from Gemini for: ${data.title}`);
                                summary = '';
                            }
                        }
                    } catch (error: any) {
                        console.error(`Error generating AI description for ${data.title}:`, error.message);
                        summary = '';
                    }
                }
            }

            return {
                ...data,
                wordCount,
                readingTime,
                summary,
                isAISummary,
            };
        } catch (error) {
            console.error(`Error reading file: ${contentFilePath}`, error);
            return {
                ...data,
                wordCount: 0,
                readingTime: 0,
                summary: '',
                isAISummary: false,
            };
        }
    },
});

export default defineConfig({
    collections: [blog],
});
