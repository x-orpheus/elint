/**
 * 默认忽略
 */
export const defaultIgnore = [
  '**/node_modules/**',
  '**/bower_components/**',
  '**/flow-typed/**',
  '**/.nyc_output/**',
  '**/coverage/**',
  '**/.git',
  '**/*.min.js',
  '**/*.min.css',
  '**/.yarn'
]

export const defaultPlugins: string[] = [
  'elint-plugin-eslint',
  'elint-plugin-stylelint',
  'elint-plugin-prettier'
]
