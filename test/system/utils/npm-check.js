'use strict'

const execa = require('execa')
const semver = require('semver')

// 检测 npm 版本，按需升级
function npmCheck () {
  const version = execa.sync('npm', ['-v']).stdout

  /**
   * 这里为了方便测试，检测比较粗暴，更具体的版本要求在 postinstall.js
   */
  if (semver.satisfies(version, '<5.1.0 || >6.1.0')) {
    return
  }

  console.log()
  console.log('升级 npm')
  console.log()

  if (process.platform === 'win32') {
    execa.sync('npm', ['install', 'npm', '-g'])
  } else {
    execa.sync('sudo', ['npm', 'install', 'npm', '-g'])
  }
}

module.exports = npmCheck
