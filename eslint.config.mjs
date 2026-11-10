import eslintConfigPrettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import noUnderscore from 'eslint-plugin-no-underscore';
import prettierPlugin from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['**/dist/**'],
  },
  ...tsPlugin.configs['flat/recommended'],
  eslintConfigPrettier,
  jsdoc.configs['flat/recommended-typescript-error'],
  sonarjs.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
      'no-underscore': noUnderscore,
    },
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          endOfLine: 'auto',
        },
      ],
      'no-underscore/no-underscore': [
        'error',
        {
          allowConstants: true,
          allowLeadingUnderscores: false,
        },
      ],
    },
  },
  {
    files: ['packages/timespan/src/**/*.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.{test,spec}.ts'],
    rules: {
      // Tests construct String objects to prove they are rejected as non-primitives.
      'sonarjs/no-primitive-wrappers': 'off',
    },
  },
];
