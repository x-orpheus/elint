'use strict'

const stylelint = require('stylelint')
const setBlocking = require('../../utils/set-blocking')
const customFormatter = require('./formatter')
const files = process.argv.slice(3)
let options = {}

try {
  options = JSON.parse(process.argv[2])
} catch (error) {
  // do nothing
}

const fix = !!options.fix

const result = {
  name: 'stylelint',
  output: '',
  success: true
}

stylelint.lint({
  files,
  formatter: customFormatter,
  fix
}).then(data => {
  result.success = !data.errored
  result.output = data.output
  return result
}).catch(error => {
  result.success = false
  result.output = error.stack
  return result
}).then(data => {
  setBlocking(true)
  process.stdout.write(JSON.stringify(data))
  process.exit()
})
