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

const CLIEngine = require('eslint').CLIEngine
const setBlocking = require('../../utils/set-blocking')
const customFormatter = require.resolve('./formatter.js')

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
 * eslint 引擎
 */
const engine = new CLIEngine({
  fix
})
const formatter = engine.getFormatter(customFormatter)
const fileReport = engine.executeOnFiles(files)

if (fix) {
  CLIEngine.outputFixes(fileReport)
}

const contentReport = []
contents.forEach(content => {
  contentReport.push(...engine.executeOnText(content.fileContent, content.fileName).results)
})

result.output = formatter([...fileReport.results, ...contentReport])

if (fileReport.errorCount || contentReport.some(item => !!item.errorCount)) {
  result.success = false
}

setBlocking(true)
process.stdout.write(JSON.stringify(result))
process.exit()
