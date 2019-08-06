'use strict'

const exec = require('../../lib/exec')
const stylelintLinter = require.resolve('./stylelint.js')

/**
 * 执行 stylelint
 *
 * @param {string[]} argus 待执行 stylelint 的文件列表
 * @returns {Promise} promise
 */
function stylelint (...argus) {
  return exec('node')(stylelintLinter, ...argus)
}

module.exports = stylelint
