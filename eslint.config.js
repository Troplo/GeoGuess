import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';

/** @type {import('eslint').Linter.Config} */
export default defineConfig({
    env: {
        browser: true,
        node: true,
        es2021: true,
        'vue/setup-compiler-macros': true,
    },
    extends: [
        ...(process.env.NODE_ENV === 'production'
            ? ['eslint:recommended']
            : []),
        'plugin:vue/vue3-essential',
        'plugin:@typescript-eslint/recommended',
        'plugin:vuetify/base',
        'prettier',
    ],
    globals: {
        launchQueue: 'readonly',
        google: 'readonly',
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2021,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
    },
    plugins: ['vue', '@typescript-eslint', 'prettier', 'vitest'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: ['error', 'always'],
        'vue/multi-word-component-names': 'off',
        'vue/valid-v-slot': 'off',
        'vue/no-duplicate-attributes': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'prettier/prettier': 'warn',
    },
    overrides: [
        {
            files: ['**/*.spec.{js,ts}'],
            extends: ['plugin:vitest/recommended'],
        },
    ],
});
