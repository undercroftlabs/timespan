const tsPlugin = require('@typescript-eslint/eslint-plugin');
const jsdoc = require('eslint-plugin-jsdoc');
const sonarjs = require('eslint-plugin-sonarjs');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const noUnderscore = require('eslint-plugin-no-underscore');

module.exports = [
  {
    ignores: ['dist/**'],
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
];
