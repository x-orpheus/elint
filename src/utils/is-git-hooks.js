'use strict';

const debug = require('debug')('elint:utils:is-git-hooks');
const co = require('co');
const find = require('find-process');

/**
 * 获取 ppid
 * node v7.x 居然不支持 process.ppid（v6.x 支持）
 *
 * @returns {Promise<number>} ppid
 */
/* istanbul ignore next */
function getPPID() {
  const ppid = process.ppid;

  if (typeof ppid === 'number') {
    return Promise.resolve(ppid);
  }

  return find('pid', process.pid)
    .then(list => {
      return list && list[0] && list[0].ppid;
    });
}

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns {Promise<boolean>} 是否是 git hooks 环境
 */
function isGitHooks() {
  return co(function* () {
    const ppid = yield getPPID();

    debug(`ppid: ${ppid}`);

    return find('pid', ppid).then(list => {
      debug('process list: %o', list);

      const cmd = list && list[0] && list[0].cmd;

      /* istanbul ignore next */
      if (!cmd) {
        return false;
      }

      return cmd.includes('node_modules/husky');
    });
  }).catch(/* istanbul ignore next */ function (err) {
    debug('error: %o', err);
    return false;
  });
}

module.exports = isGitHooks;
