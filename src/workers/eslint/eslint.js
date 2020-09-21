'use strict'

const result = {
  name: 'eslint',
  output: '',
  success: true
}

process.on('uncaughtException', error => {
  result.output = error.stack
  result.success = false

  process.stdout.write(JSON.stringify(result))
  process.exit()
})

const setBlocking = require('../../utils/set-blocking')
const formatter = require('./formatter')
const { lintFiles, lintContents } = require('./lint')

/**
 * 输入文件处理
 * 输入的数据类似：node file.js "{\"fix\": true}" a.js b.js c.js
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
    files.push(item)
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

/**
 * 执行 eslint
 */
const filesResult = lintFiles(files, fix)
const contentsResult = lintContents(contents)

result.success = filesResult.success && contentsResult.success
result.output = formatter([...filesResult.results, ...contentsResult.results])

setBlocking(true)
process.stdout.write(JSON.stringify(result))
process.exit()
