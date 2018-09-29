'use strict'

const stylish = require('eslint/lib/formatters/stylish')

/**
 * @typedef {Object} ESLintResultMessage
 *
 * @property {string} ruleId rules名
 * @property {number} severity 错误级别
 * @property {string} message 提示
 * @property {number} line 开始行号
 * @property {number} column 开始列号
 * @property {string} nodeType nodeType
 * @property {number} endLine 结束行号
 * @property {number} endColumn 结束列号
 */

/**
 * @typedef {Object} ESLintResult
 *
 * @property {string} filePath 文件路径
 * @property {ESLintResultMessage[]} messages 消息
 * @property {number} errorCount 错误数
 * @property {number} warningCount 警告数
 * @property {number} fixableErrorCount 可修复错误数
 * @property {number} fixableWarningCount 可修复警告数
 */

/**
 * 自定义 eslint formatter
 *
 * @param {ESLintResult[]} results eslint 结果
 * @returns {string} report
 */
function formatter (results) {
  const warnings = []
  const errors = []

  results.forEach(result => {
    if (!result.warningCount) {
      errors.push(result)
      return
    } else if (!result.errorCount) {
      warnings.push(result)
      return
    }

    const warningMessages = []
    const errorMessages = []

    result.messages.forEach(message => {
      if (message.severity === 1) {
        warningMessages.push(message)
      } else {
        errorMessages.push(message)
      }
    })

    warnings.push(Object.assign({}, result, { messages: warningMessages }))
    errors.push(Object.assign({}, result, { messages: errorMessages }))
  })

  return stylish([].concat(warnings, errors))
}

module.exports = formatter
