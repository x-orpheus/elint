'use strict'

const chalk = require('chalk')
const figures = require('figures')

/**
 * 按行（每行）缩进指定宽度
 *
 * @param {string} string 要操作的字符串
 * @param {number} [span=2] 缩进
 * @returns {string} 处理后的文本
 */
function padding (string, span = 2) {
  const spaces = ' '.repeat(span)
  return spaces + string.replace(/\n/g, `\n${spaces}`)
}

/**
 * 移除多余的空行
 * 连续两个以上的 \n 合并为两个
 *
 * @param {string} string 要操作的字符串
 * @returns {string} 处理后的文本
 */
function reduceEmptyLine (string) {
  return string.replace(/\n([ ]*\n)+/g, '\n\n')
}

/**
 * @typedef Result
 * @property {string} name 段落名
 * @property {string} output 段落内容
 * @property {boolean} success 是否成功
 */

const passedMessage = chalk.green(`${figures.tick} Passed`)

/**
 * report
 *
 * @param {Result[]} results 要输出到命令行的内容
 * @returns {string} output
 */
function report (results) {
  const arr = []

  results.forEach(result => {
    const name = result.name
    const output = result.output
    const success = result.success

    arr.push('\n')
    arr.push(`${chalk.bold(`> ${name}:`)}\n`)
    arr.push('\n')

    if (success && !output.trim()) {
      arr.push(padding(passedMessage))
    } else {
      arr.push(padding(output))
    }

    arr.push('\n')
  })

  arr.push('\n')

  return reduceEmptyLine(arr.join(''))
}

module.exports = report
