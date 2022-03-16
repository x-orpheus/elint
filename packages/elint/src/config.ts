/**
 * 支持的 js, ts 文件后缀
 */
const esSuffix = ['.js', '.jsx', '.ts', '.tsx', '.mjs']

/**
 * 支持的 css 文件后缀
 */
const cssSuffix = ['.css', '.scss', '.sass', '.less']

/**
 * 支持的 linter
 */
export const linterSuffix = {
  es: esSuffix,
  style: cssSuffix
} as const

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
