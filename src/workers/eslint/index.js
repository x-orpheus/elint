'use strict'

const exec = require('../../lib/exec')
const eslintLinter = require.resolve('./eslint.js')

/**
 * 执行 eslint
 *
 * @param {string[]} argus 待执行 eslint 的文件列表
 * @returns {Promise} promise
 */
function eslint (...argus) {
  return exec('node')(eslintLinter, ...argus)
}

module.exports = eslint
