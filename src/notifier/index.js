'use strict'

const debug = require('debug')('elint:notifier')
const exec = require('../lib/exec')
const conf = require('./config')
const checker = require.resolve('./checker.js')

let updateVersion

function run () {
  debug('run checker')

  if (process.env.ELINT_DISABLE_UPDATE_NOTIFIER) {
    return
  }

  exec('node')(checker)
    .then(result => {
      debug(`checker result: ${result}`)
      updateVersion = result.stdout
    })
    .catch(error => {
      debug('checker error: %o', error)
    })
}

// 显示更新通知
function notify () {
  if (!updateVersion) {
    return
  }

  debug('run notifier')

  conf.notify()

  console.log(`new version: ${updateVersion}`)
}

run()

module.exports = {
  notify
}
