export type Suffix = `.${string}`

/**
 * 支持的 js, ts 文件后缀
 */
const esSuffix: Suffix[] = ['.js', '.jsx', '.ts', '.tsx', '.mjs']

/**
 * 支持的 css 文件后缀
 */
const cssSuffix: Suffix[] = ['.css', '.scss', '.sass', '.less']

export type LinterName = 'es' | 'style'

/**
 * 支持的 linter
 */
export const linterSuffix: Record<LinterName, Suffix[]> = {
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
