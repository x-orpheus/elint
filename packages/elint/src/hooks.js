'use strict'

const debug = require('debug')('elint:hooks')
const path = require('path')
const exec = require('./lib/exec')
const log = require('./utils/log')
const pragram = require.resolve('husky/lib/installer/bin')
const huskyDir = path.join(pragram, '../../..')

// 支持的 actions
const supportActions = [
  'install',
  'uninstall'
]

/**
 * install & uninstall git hooks
 *
 * @param {string} action 要执行的 action
 * @returns {void}
 */
function runHooks (action) {
  debug(`input action: ${action}`)
  debug(`husky pragram path: ${pragram}`)
  debug(`husky dir: ${huskyDir}`)

  if (!action) {
    log.error('请输入 action, 例如：elint hooks install')
    process.exit(1)
  }

  if (!supportActions.includes(action)) {
    log.error(`不支持的 action: ${action}`)
    process.exit(1)
  }

  // huskyDir 必须指定
  exec('node')(pragram, action, huskyDir)
    .then(({ stdout }) => {
      const logFn = stdout.includes('done') ? log.success : log.info
      const message = stdout.replace(/husky > /g, '').split('\n')

      logFn(...message)
    })
    .catch(error => {
      log.error(error.message || 'error')
    })
}

module.exports = runHooks
