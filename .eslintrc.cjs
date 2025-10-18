module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: [
        ...(process.env.NODE_ENV === 'production'
            ? ['eslint:recommended']
            : []),
        'plugin:vue/essential',
        'plugin:@typescript-eslint/recommended', // add this
        'prettier', // optional, for Prettier integration
    ],
    parser: 'vue-eslint-parser', // required for <script setup>
    parserOptions: {
        parser: '@typescript-eslint/parser', // add this
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['vue', '@typescript-eslint', 'prettier', 'vitest'],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: ['error', 'always'],
        'vue/multi-word-component-names': 'off',
        'vue/valid-v-slot': 'off',
    },
    overrides: [
        {
            files: ['**/*.spec.js'],
            env: {
                jest: true,
            },
        },
    ],
};
