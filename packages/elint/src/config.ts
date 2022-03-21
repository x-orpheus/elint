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

export const defaultWorkers: string[] = [
  'elint-worker-eslint',
  'elint-worker-stylelint',
  'elint-worker-prettier',
  'elint-worker-commitlint'
]
