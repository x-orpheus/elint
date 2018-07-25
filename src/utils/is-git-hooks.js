'use strict'

const debug = require('debug')('elint:utils:is-git-hooks')
const co = require('co')
const find = require('find-process')

const huskyCmdReg = /node_modules(\/|\\)husky/

/**
 * 获取 ppid
 * node v7.x 居然不支持 process.ppid（v6.x 支持）
 *
 * @returns {Promise<number>} ppid
 */
/* istanbul ignore next */
function getPPID () {
  const ppid = process.ppid

  if (typeof ppid === 'number') {
    return Promise.resolve(ppid)
  }

  return find('pid', process.pid)
    .then(list => {
      return list && list[0] && list[0].ppid
    })
}

/**
 * 根据 pid 判断是否由 husky 调用
 *
 * @param {string} ppid parent pid
 * @returns {Promise<boolean>} 是否是 husky 调用
 */
function isRunByHusky (ppid) {
  return find('pid', ppid).then(list => {
    debug('process list: %o', list)

    const cmd = list[0] && list[0].cmd
    const pppid = list[0] && list[0].ppid

    if (!cmd) {
      return false
    }

    if (huskyCmdReg.test(cmd)) {
      return true
    }

    // 一直迭代到最顶
    return isRunByHusky(pppid)
  })
}

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns {Promise<boolean>} 是否是 git hooks 环境
 */
function isGitHooks () {
  return co(function * () {
    const ppid = yield getPPID()

    debug(`ppid: ${ppid}`)

    return isRunByHusky(ppid)
  }).catch(/* istanbul ignore next */ function (err) {
    debug('error: %o', err)
    return false
  })
}

module.exports = isGitHooks
