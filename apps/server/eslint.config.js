// @ts-check
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';
import baseConfig from '../../eslint.config.base.js';

export default tseslint.config(
  // 忽略不需要檢查的檔案
  {
    ignores: ['dist/**', 'coverage/**', '*.config.js', '*.config.mjs'],
  },
  ...baseConfig,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  }
);
