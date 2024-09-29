// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./config/eslint-config/next.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
};
