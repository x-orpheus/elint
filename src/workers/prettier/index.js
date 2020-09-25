'use strict'

const exec = require('../../lib/exec')
const prettierLinter = require.resolve('./prettier.js')

function prettier (...argus) {
  return exec('node')(prettierLinter, ...argus)
}

module.exports = prettier
