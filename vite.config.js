import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import eslintPlugin from 'vite-plugin-eslint';
import path from 'path';

const resolve = (file) => {
    return path.resolve(__dirname, file);
};

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        vue({ template: { transformAssetUrls } }),
        eslintPlugin(),
        vuetify({
            autoImport: true,
        }),
    ],
    server: {
        port: 8080,
    },
});
