'use strict'

const execa = require('execa')

// 检测 npm 版本，按需升级
function npmCheck () {
  const version = execa.sync('npm', ['-v']).stdout
  const versions = version.split('.')

  if (versions[0] !== '5' || !['4', '5', '6'].includes(versions[1])) {
    return
  }

  console.log('升级 npm')

  if (process.platform === 'win32') {
    execa.sync('npm', ['install', 'npm', '-g'])
  } else {
    execa.sync('sudo', ['npm', 'install', 'npm', '-g'])
  }
}

module.exports = npmCheck
