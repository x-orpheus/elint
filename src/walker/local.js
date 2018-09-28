'use strict'

const globby = require('globby')
const { getBaseDir } = require('../env')

/**
 * 本地文件遍历
 *
 * @param {Array<string>} [patterns] 匹配模式
 * @param {Array<string>} [ignorePatterns] 忽略模式
 *
 * @returns {Array<string>} file list
 */
function walker (patterns = [], ignorePatterns = []) {
  const baseDir = getBaseDir()

  return globby(patterns, {
    cwd: baseDir,
    gitignore: true,
    ignore: ignorePatterns,
    dot: true,
    onlyFiles: true,
    absolute: false
  })
}

module.exports = walker
