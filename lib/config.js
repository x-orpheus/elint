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
const linterSuffix = {
  eslint: jsSuffix,
  stylelint: cssSuffix
};

/**
 * 支持的配置文件
 */
const linterConfigFile = {
  eslint: '.eslintrc.js',
  stylelint: '.stylelintrc.js'
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
  linterSuffix,
  linterConfigFile,
  jsSuffix,
  cssSuffix,
  defaultIgnore
};
