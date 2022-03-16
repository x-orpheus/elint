'use strict'

const chalk = require('chalk')
const figures = require('figures')

/**
 * @typedef ColorFnAndIcon
 * @property {function} colorFn 着色函数
 * @property {string} icon 图标
 */

/**
 * 根据 type 获取 colorFn 和 Icon
 *
 * @param {string} type 日志类型
 * @returns {ColorFnAndIcon} colorFn and icon
 */
function getColorFnAndIconByType (type) {
  let colorFn, icon

  switch (type) {
    case 'error':
      colorFn = chalk.red
      icon = figures.cross
      break
    case 'warn':
      colorFn = chalk.yellow
      icon = figures.warning
      break
    case 'success':
      colorFn = chalk.green
      icon = figures.tick
      break
    default:
      colorFn = chalk.blue
      icon = figures.info
      break
  }

  return { colorFn, icon }
}

/**
 * 构造日志函数
 *
 * @param {string} type 日志类型
 * @returns {function} log function
 */
function log (type) {
  return (...message) => {
    if (!message.length) {
      return
    }

    const { colorFn, icon } = getColorFnAndIconByType(type)
    const output = ['']

    message.forEach((item, index) => {
      if (index === 0) {
        output.push(`  ${icon} ${item}`)
        return
      }

      output.push(`    ${item}`)
    })

    output.push('')

    console.log(colorFn(output.join('\n')))
  }
}

module.exports = {
  error: log('error'),
  warn: log('warn'),
  success: log('success'),
  info: log()
}
