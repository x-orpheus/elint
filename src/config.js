'use strict'

/**
 * 支持的 js, ts 文件后缀
 */
const esSuffix = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs'
]

/**
 * 支持的 css 文件后缀
 */
const cssSuffix = [
  '.css',
  '.scss',
  '.sass',
  '.less'
]

/**
 * 支持的 linter
 */
const linterSuffix = {
  es: esSuffix,
  style: cssSuffix
}

/**
 * 默认忽略
 */
const defaultIgnore = [
  '**/node_modules/**',
  '**/bower_components/**',
  '**/flow-typed/**',
  '**/.nyc_output/**',
  '**/coverage/**',
  '**/.git',
  '**/*.min.js',
  '**/*.min.css',
  '**/.yarn',
  '.eslintrc.js',
  '.stylelintrc.js',
  '.huskyrc.js',
  '.commitlintrc.js',
  '.prettierrc.js'
]

module.exports = {
  linterSuffix,
  defaultIgnore
}
