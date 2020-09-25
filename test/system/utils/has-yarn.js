'use strict'

const { execSync } = require('child_process')

let _hasYarn

function hasYarn () {
  if (_hasYarn != null) {
    return _hasYarn
  }
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

module.exports = hasYarn
