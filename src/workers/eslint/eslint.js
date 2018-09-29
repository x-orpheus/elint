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

// 输入参数
const files = process.argv.slice(3)
let options = {}

try {
  options = JSON.parse(process.argv[2])
} catch (err) {
  // do nothing
}

const fix = !!options.fix
const engine = new CLIEngine({
  fix
})
const formatter = engine.getFormatter(customFormatter)
const report = engine.executeOnFiles(files)

if (fix) {
  CLIEngine.outputFixes(report)
}

if (report.errorCount) {
  result.success = false
}

result.output = formatter(report.results)

setBlocking(true)
process.stdout.write(JSON.stringify(result))
process.exit()
