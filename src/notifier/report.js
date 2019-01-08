'use strict'

const chalk = require('chalk')
const boxen = require('boxen')

/**
 * @typedef ReportInfo
 * @property {stirng} name preset 名称
 * @property {stirng} current 当前版本
 * @property {stirng} latest 最新版本
 */

/**
 * 生成 notifier 报告
 *
 * @param {ReportInfo} info 报告基础信息
 * @returns {string} 用于输出的内容
 */
function report (info) {
  if (!info) {
    return null
  }

  const { name, current, latest } = info

  if (!name || !current || !latest) {
    return null
  }

  const messages = [
    `update available ${chalk.dim(current)} → ${chalk.green(latest)}`,
    `Run ${chalk.cyan('npm i ' + name + ' -D')} to update`
  ]

  const boxenOptions = {
    padding: 1,
    margin: 1,
    align: 'center',
    borderColor: 'yellow',
    borderStyle: 'round'
  }

  return boxen(messages.join('\n'), boxenOptions)
}

module.exports = report
