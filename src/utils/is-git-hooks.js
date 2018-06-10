'use strict';

const find = require('find-process');

/**
 * 判断执行环境是否是 git hooks
 *
 * @returns {Promise<boolean>} 是否是 git hooks 环境
 */
function isGitHooks() {
  const ppid = process.ppid;

  // 暂时未发现 cmd 不存在和 reject 的情况
  return find('pid', ppid)
    .then(function (list) {
      const cmd = list && list[0].cmd;

      /* istanbul ignore next */
      if (!cmd) {
        return false;
      }

      return cmd.includes('node_modules/husky');
    })
    .catch(/* istanbul ignore next */ function (err) {
      return false;
    });
}

module.exports = isGitHooks;
