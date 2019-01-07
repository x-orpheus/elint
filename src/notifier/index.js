'use strict'

const debug = require('debug')('elint:notifier')
const exec = require('../lib/exec')
const conf = require('./config')
const checker = require.resolve('./checker.js')

debug('run checker')

let updateVersion

exec('node')(checker).then(version => {
  debug(`update version: ${version}`)
  updateVersion = version
})

// 显示更新通知
function notify () {
  if (!updateVersion) {
    return
  }

  debug('run notifier')

  conf.notify();

  console.log(`new version: ${updateVersion}`)
}

module.exports = {
  notify
}
