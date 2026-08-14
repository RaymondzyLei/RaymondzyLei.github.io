import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', '.remember', '.claude', '.superpowers']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'scrollTo',
          message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='scrollIntoView']",
          message: 'Use lenis?.scrollTo(element) instead of element.scrollIntoView (see CLAUDE.md)',
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='scrollTo']",
          message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
        },
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },
  // Turn off all rules that conflict with Prettier formatting.
  prettierConfig,
]);
