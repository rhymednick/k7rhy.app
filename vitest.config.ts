import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        // Use forks pool to avoid jsdom/webidl-conversions compatibility issues in CI environments
        // This isolates each test file in its own process, preventing module loading conflicts
        pool: 'forks',
    },
});
