import pluginJs from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  pluginJs.configs.recommended,
  {
    ignores: [ 'dist/**/*' ]
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    }
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    rules: {
      indent: [ 'error', 2 ],
      quotes: [ 'error', 'single' ],
      semi: [ 'error', 'always' ],
      'linebreak-style': [ 'error', 'unix' ],
      'object-curly-spacing': [ 'error', 'always' ],
      'array-bracket-spacing': [ 'error', 'always' ],
      'space-in-parens': [ 'error', 'always' ],
      'max-len': [ 'error', { 'code': 400 } ],
      'comma-dangle': [ 'error', { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' } ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  }
];