const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
    require.resolve('@vercel/style-guide/eslint/next'),
    'eslint-config-turbo',
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ['only-warn', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  plugins: ['react', '@typescript-eslint', 'prettier', 'react-hooks', 'simple-import-sort'],
  rules: {
    'no-use-before-define': 'off',
    'no-unused-vars': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'valid-typeof': 'off',
    'react/no-unescaped-entities': 'warn',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    trailingComma: 'es5',
    bracketSpacing: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
  ],
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
};
