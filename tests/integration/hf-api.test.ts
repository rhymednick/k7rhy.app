import { describe, it, expect } from 'vitest';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6';

describe('Hugging Face API Integration', () => {
    // Skip if no token is present (e.g. in CI without secrets)
    const runTest = API_TOKEN ? it : it.skip;

    runTest(
        'successfully generates a summary',
        async () => {
            const text = 'This is a long article about testing APIs. It is very important to verify that external services are working correctly. Integration tests help us catch issues that unit tests might miss. By sending a real request to the API, we can ensure that our authentication token is valid and that the endpoint is responsive.';

            try {
                const response = await axios.post(
                    MODEL_URL,
                    { inputs: text },
                    {
                        headers: {
                            Authorization: `Bearer ${API_TOKEN}`,
                        },
                    }
                );

                expect(response.status).toBe(200);
                expect(response.data).toBeDefined();
                expect(Array.isArray(response.data)).toBe(true);
                expect(response.data[0]).toHaveProperty('summary_text');
                expect(typeof response.data[0].summary_text).toBe('string');
                expect(response.data[0].summary_text.length).toBeGreaterThan(0);

                console.log('Generated Summary:', response.data[0].summary_text);
            } catch (error: any) {
                console.error('API Error:', error.response?.data || error.message);
                throw error;
            }
        },
        30000
    ); // Increase timeout for API call
});
