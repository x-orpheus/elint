'use strict'

const debug = require('debug')('elint:notifier')
const conf = require('./config')
const checker = require('./checker')
const report = require('./report')

// 显示更新通知
function notify () {
  if (process.env.ELINT_DISABLE_UPDATE_NOTIFIER) {
    return Promise.resolve(null)
  }

  debug('run checker')

  return checker().then(result => {
    if (!result || !result.name || !result.latest || !result.current) {
      return null
    }

    conf.update(result.name)

    return report(result)
  })
}

module.exports = {
  notify
}
