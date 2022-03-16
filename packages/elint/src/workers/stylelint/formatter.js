'use strict'

const stringFormatter = require('stylelint').formatters.string

/**
 * @typedef {Object} StylelintResultWarning
 *
 * @property {string} severity 错误级别
 */

/**
 * @typedef {Object} StylelintResult
 *
 * @property {StylelintResultWarning[]} warnings 异常信息
 */

/**
 * 自定义 stylelint formatter
 *
 * @param {StylelintResult[]} results lint result
 * @returns {string} report
 */
function formatter (results) {
  const warnings = []
  const errors = []

  results.forEach(result => {
    if (!result.warnings.length) {
      errors.push(result)
      return
    }

    const warningMessages = []
    const errorMessages = []

    result.warnings.forEach(message => {
      if (message.severity === 'warning') {
        warningMessages.push(message)
      } else {
        errorMessages.push(message)
      }
    })

    warnings.push(Object.assign({}, result, { warnings: warningMessages }))
    errors.push(Object.assign({}, result, { warnings: errorMessages }))
  })

  return stringFormatter([].concat(warnings, errors))
}

module.exports = formatter
