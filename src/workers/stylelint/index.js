'use strict'

const exec = require('../../lib/exec')
const fileLinter = require.resolve('./file.js')
const textLinter = require.resolve('./text.js')

/**
 * 执行 stylelint 校验文件
 *
 * @param {string[]} argus 待执行 stylelint 的文件列表
 * @returns {Promise} promise
 */
function stylelintFileLinter (...argus) {
  return exec('node')(fileLinter, ...argus)
}

/**
 * 执行 stylelint 校验文本
 *
 * @param {string} code 待校验的文本
 * @param {string} codeFilename 待校验文本的文件名
 * @returns {Promise} promise
 */
function stylelintTextLinter (code, codeFilename) {
  return exec('node')(textLinter, code, codeFilename)
}

module.exports = {
  stylelintFileLinter,
  stylelintTextLinter
}
