import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      indent: [
        'error',
        2
      ],
      'linebreak-style': [
        'error',
        'unix'
      ],
      quotes: [
        'error',
        'single'
      ],
      semi: [
        'error',
        'always'
      ],
      'object-curly-spacing': [
        'error',
        'always'
      ],
      'array-bracket-spacing': [
        'error',
        'always'
      ],
      'space-in-parens': [
        'error',
        'always'
      ],
      'max-len': [
        'error',
        { 'code': 400 }
      ],
      'comma-dangle': [
        'error',
        { arrays: 'never', objects: 'never', imports: 'never', exports: 'never', functions: 'never' }
      ]
    }
  },
  pluginJs.configs.recommended
];