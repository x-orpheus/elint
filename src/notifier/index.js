'use strict'

const debug = require('debug')('elint:notifier')
const conf = require('./config')
const checker = require('./checker')
const report = require('./report')

/**
 * 获取更新通知
 *
 * @returns {Promise<string>} 用于输出的内容
 */
function notify () {
  debug('run checker')
  debug(`ELINT_DISABLE_UPDATE_NOTIFIER: ${process.env.ELINT_DISABLE_UPDATE_NOTIFIER}`)

  if (process.env.ELINT_DISABLE_UPDATE_NOTIFIER === 'true') {
    return Promise.resolve(null)
  }

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
