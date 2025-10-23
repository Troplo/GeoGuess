import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        // Mock CSS imports
        css: false,
        setupFiles: './tests/unit/setup.js',
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
