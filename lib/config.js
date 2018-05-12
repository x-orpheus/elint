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

module.exports = {
  linter,
  jsSuffix,
  cssSuffix
};
