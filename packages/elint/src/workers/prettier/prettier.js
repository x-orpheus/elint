'use strict'

const path = require('path')
const { flatten } = require('lodash')
const setBlocking = require('../../utils/set-blocking')
const eslintFormatter = require('../eslint/formatter')
const stylelintFormatter = require('../stylelint/formatter')
const prettierFormatter = require('./formatter')
const { lintFiles, lintContents } = require('./lint')

const linterName = {
  es: 'eslint',
  style: 'stylelint'
}

const crossPlatformPath = (str) => {
  return process.platform === 'win32' ? str.replace(/\\/g, '/') : str
}

// 坑爹的新版 stylelint，files 要根据 cwd 解析
const cwd = crossPlatformPath(process.cwd())

;(async () => {
  /**
   * 输入文件处理
   * 输入的数据类似：node file.js "{\"fix\": true}" a.js b.js c.js
   */
  const fileAndContents = process.argv.slice(3)
  const files = []
  const contents = []

  fileAndContents.forEach((item) => {
    if (item && item.includes('{')) {
      try {
        contents.push(JSON.parse(item))
      } catch (e) {
        // do nothing
      }
    } else {
      files.push(crossPlatformPath(path.relative(cwd, item)))
    }
  })

  /**
   * 处理 options
   */
  let options = {}

  try {
    options = JSON.parse(process.argv[2])
  } catch (err) {
    // do nothing
  }

  const fix = !!options.fix
  const type = options.type

  const tasks = []

  if (files.length) {
    tasks.push(lintFiles(files, type, fix))
  }

  if (contents.length) {
    tasks.push(lintContents(contents, type))
  }

  const lintResults = await Promise.all(tasks)

  let linterSuccess = true
  let prettierSuccess = true
  const prettierOutput = []
  const lintOutput = []

  lintResults.forEach((item) => {
    linterSuccess = linterSuccess && item.linterSuccess
    prettierSuccess = prettierSuccess && item.prettierSuccess
    if (item.messages) {
      prettierOutput.push(prettierFormatter(item.messages))
    }
    switch (type) {
      case 'es':
        lintOutput.push(eslintFormatter(item.results))
        break
      case 'style':
        lintOutput.push(stylelintFormatter(flatten(item.results)))
        break
      default:
    }
  })

  const prettierResult = {
    name: 'prettier',
    output: prettierOutput.join(''),
    success: prettierSuccess
  }

  const linterResult = {
    name: linterName[type] || type,
    output: lintOutput.join(''),
    success: linterSuccess
  }

  setBlocking(true)
  process.stdout.write(JSON.stringify([prettierResult, linterResult]))
  process.exit()
})().catch((error) => {
  process.stdout.write(
    JSON.stringify({
      name: 'prettier',
      output: error.stack,
      success: false
    })
  )
  process.exit()
})
