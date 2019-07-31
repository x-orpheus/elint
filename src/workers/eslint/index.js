'use strict'

const exec = require('../../lib/exec')
const fileLinter = require.resolve('./file.js')
const textLinter = require.resolve('./text.js')

/**
 * 执行 eslint 校验文件
 *
 * @param {string[]} argus 待执行 eslint 的文件列表
 * @returns {Promise} promise
 */
function eslintFileLinter (...argus) {
  return exec('node')(fileLinter, ...argus)
}

/**
 * 执行 eslint 校验文本
 *
 * @param {string} text 待校验的文本
 * @param {string} fileName 文本的文件名
 * @returns {Promise} promise
 */
function eslintTextLinter (text, fileName) {
  return exec('node')(textLinter, text, fileName)
}

module.exports = {
  eslintFileLinter,
  eslintTextLinter
}
