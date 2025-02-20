import tsParser from '@typescript-eslint/parser';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import mochaPlugin from 'eslint-plugin-mocha';

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  mochaPlugin.configs.flat.recommended,
  eslintConfigPrettier,
  {
    // Disable Mocha rules in .spec.ts files
    files: ['**/*.spec.ts'],
    rules: {
      'mocha/consistent-spacing-between-blocks': 'off',
      'mocha/no-mocha-arrows': 'off',
    },
  },
  {
    languageOptions: { parser: tsParser },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
);
