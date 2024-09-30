import tseslint from 'typescript-eslint'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default tseslint.config(
  ...compat.extends('eslint-config-standard'),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    rules: {
      'space-before-function-paren': 0,
      // specify the maximum length of a line in your program
      // https://eslint.org/docs/rules/max-len
      'max-len': [
        'error',
        100,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true
        }
      ],
      '@typescript-eslint/no-var-requires': 'off',
      'import/extensions': ['error', 'always'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      'n/prefer-node-protocol': [
        'error',
        {
          version: '>=16.0.0'
        }
      ]
    }
  },
  {
    ignores: [
      '**/elint-preset-self/',
      '**/test/unit/test-project/',
      '**/test/system/test-project/',
      '**/test/system/test-preset/',
      '**/dist/'
    ]
  }
)
