'use strict'

const _ = require('lodash')
const path = require('path')
const stylelint = require('stylelint')
const setBlocking = require('../../utils/set-blocking')
const customFormatter = require('./formatter')

const crossPlatformPath = (str) => {
  return process.platform === 'win32' ? str.replace(/\\/g, '/') : str
}

// 坑爹的新版 stylelint，files 要根据 cwd 解析
const cwd = crossPlatformPath(process.cwd())

const lintFiles = (files, fix) => {
  return stylelint
    .lint({
      files,
      fix
    })
    .then(data => ({
      success: !data.errored,
      output: data.results
    }))
    .catch(error => ({
      success: false,
      output: error.stack
    }))
}

const lintContent = (code, codeFilename) => {
  return stylelint
    .lint({
      code,
      codeFilename
    })
    .then(data => ({
      success: !data.errored,
      output: data.results
    }))
    .catch(error => ({
      success: false,
      output: error.stack
    }))
}

;(async () => {
  /**
   * 处理输入文件
   */
  const fileAndContents = process.argv.slice(3)
  const files = []
  const contents = []

  fileAndContents.forEach(item => {
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
  } catch (error) {
    // do nothing
  }

  const fix = !!options.fix

  /**
   * 生成 task
   */
  const tasks = []

  if (files.length) {
    tasks.push(lintFiles(files, fix))
  }

  if (contents.length) {
    contents.forEach(content => tasks.push(lintContent(content.fileContent, content.fileName)))
  }

  /**
   * 执行 stylelint，处理结果
   */
  const lintResults = await Promise.all(tasks)

  let success = true
  const output = []

  lintResults.forEach(item => {
    success = success && item.success
    output.push(item.output)
  })

  const result = {
    name: 'stylelint',
    output: customFormatter(_.flatten(output)),
    success
  }

  /**
   * 输出结果
   */
  setBlocking(true)
  process.stdout.write(JSON.stringify(result))
  process.exit()
})()
