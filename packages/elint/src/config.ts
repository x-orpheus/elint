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

export const UPDATE_CHECK_FREQUENCY = 1000 * 60 * 60 * 24 // 1 day
