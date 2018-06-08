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
      const cwd = list && list[0].cwd;

      if (!cwd) {
        return false;
      }

      return cwd.startsWith('node node_modules/husky');
    })
    .catch(function (err) {
      return false;
    });
}

module.exports = isGitHooks;
