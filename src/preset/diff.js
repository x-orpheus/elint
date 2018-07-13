'use strict'

const debug = require('debug')('elint:preset:diff')
const fs = require('fs-extra')
const path = require('path')
const jsDiff = require('diff')
const chalk = require('chalk')
const leftPad = require('left-pad')
const findConfigFiles = require('./find-config-files')
const { getBaseDir } = require('../env')

/**
 * @typedef {Object} ConfigFilesObj
 * @property {string} name 文件名
 * @property {string} content 文件内容
 */

/**
 * 取所有需要 diff 的配置文件
 *
 * @returns {Array<ConfigFilesObj>} 配置文件对象
 */
function getConfigFiles () {
  const baseDir = getBaseDir()
  const configFiles = findConfigFiles(baseDir)
  const result = []

  configFiles.forEach(configFile => {
    const fileParsedObj = path.parse(configFile)
    const newFileName = `${fileParsedObj.name}${fileParsedObj.ext}`
    const newFilePath = configFile
    const oldFileName = `${fileParsedObj.name}.old${fileParsedObj.ext}`
    const oldFilePath = path.join(baseDir, oldFileName)

    if (!fs.existsSync(oldFilePath)) {
      return
    }

    const newFileContent = fs.readFileSync(newFilePath, { encoding: 'utf-8' })
    const oldFileContent = fs.readFileSync(oldFilePath, { encoding: 'utf-8' })

    result.push([
      {
        name: oldFileName,
        content: oldFileContent
      },
      {
        name: newFileName,
        content: newFileContent
      }
    ])
  })

  return result
}

/**
 * 给 hunk 填充行号
 *
 * @param {jsDiff.hunk} hunk diff.hunk
 * @returns {jsDiff.hunk} hunk
 */
function fillLineNumber (hunk) {
  if (!hunk) {
    return hunk
  }

  const maxLineNumber = hunk.newStart + hunk.newLines
  const span = maxLineNumber.toString().length + 4 // 多四个空格

  let index = hunk.newStart
  let line
  let lineNumberStr
  let colorFn

  for (let i = 0, j = hunk.lines.length; i < j; i++) {
    line = hunk.lines[i]

    if (line.startsWith('-')) {
      lineNumberStr = leftPad('| ', span)
      colorFn = chalk.red
    } else if (line.startsWith('-')) {
      lineNumberStr = leftPad(`${index++} | `, span)
      colorFn = chalk.green
    } else {
      lineNumberStr = leftPad(`${index++} | `, span)
      colorFn = n => n
    }

    hunk.lines[i] = colorFn(line.slice(0, 1)) +
      lineNumberStr +
      colorFn(line.slice(1))
  }

  return hunk
}

/**
 * 执行 diff
 *
 * @returns {void}
 */
function diff () {
  const files = getConfigFiles()

  debug('diff files: %o', files)

  const output = []

  files.forEach(f => {
    const result = jsDiff.structuredPatch(f[0].name, f[1].name, f[0].content, f[1].content)

    debug('diff result: %o', result)

    output.push('-------------------------------------------------\n')
    // eslint-disable-next-line max-len
    output.push(`diff ${chalk.blue(result.newFileName)} ${chalk.blue(result.oldFileName)}\n`)
    output.push('-------------------------------------------------\n')

    result.hunks.forEach(hunk => {
      fillLineNumber(hunk)

      const lines = hunk.lines.map(line => {
        if (line.startsWith('+')) {
          return chalk.green(line)
        }
        if (line.startsWith('-')) {
          return chalk.red(line)
        }
        return line
      })

      output.push(lines.join('\n'))
      output.push('\n')
    })

    output.push('\n')
  })

  console.log(output.join(''))
}

module.exports = diff
