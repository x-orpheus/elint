'use strict';

/**
 * 支持的 js 文件后缀
 */
const jsSuffix = [
  '.js',
  '.jsx'
];

/**
 * 支持的 css 文件后缀
 */
const cssSuffix = [
  '.css',
  '.scss',
  '.sass',
  '.less'
];

/**
 * 支持的 linter
 */
const linter = {
  eslint: jsSuffix,
  stylelint: cssSuffix
};

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
  '**/*.min.css'
];

module.exports = {
  linter,
  jsSuffix,
  cssSuffix,
  defaultIgnore
};
