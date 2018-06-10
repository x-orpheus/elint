'use strict';

const find = require('find-process');

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns {Promise<boolean>} 是否是 git hooks 环境
 */
function isGitHooks() {
  const ppid = process.ppid;

  return find('pid', ppid)
    .then(function (list) {
      const cmd = list && list[0].cmd;

      if (!cmd) {
        /* istanbul ignore next */
        return false;
      }

      return cmd.includes('node_modules/husky');
    })
    .catch(function (err) { /* istanbul ignore next */
      return false;
    });
}

module.exports = isGitHooks;
