'use strict';

const globby = require('globby');
const { getBaseDir } = require('../env');

/**
 * 本地文件遍历
 *
 * @param {Array<string>} [patterns] 匹配模式
 * @returns {Array<string>} file list
 */
function walker(patterns = []) {
  const baseDir = getBaseDir();

  return globby(patterns, {
    cwd: baseDir,
    gitignore: true,
    dot: true,
    onlyFiles: true,
    absolute: false
  });
}

module.exports = walker;
