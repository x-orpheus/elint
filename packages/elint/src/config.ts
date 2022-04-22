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

/**
 * 更新检查周期
 */
export const UPDATE_CHECK_FREQUENCY = 1000 * 60 * 60 * 24 // 1 day

/**
 * 默认 preset
 */
export const PRESET_PATTERN = /elint-preset-/

/**
 * 缓存文件名
 */
export const CACHE_FILENAME = '.elintcache'
