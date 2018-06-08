'use strict';

const debug = require('debug')('elint:walker');
const co = require('co');
const isGitHooks = require('../utils/is-git-hooks');
const { getFileTree, fillFileTree } = require('./filetree');
const local = require('./local');
const stage = require('./stage');

/**
 * 文件遍历
 *
 * @param {Array<string>} patterns 匹配模式
 * @returns {Promise<object>} file tree
 */
function walker(patterns) {
  debug(`input glob patterns: ${patterns}`);

  const fileTree = getFileTree();

  if (!patterns || (Array.isArray(patterns) && !patterns.length)) {
    return Promise.resolve(fileTree);
  }

  return co(function* () {
    const isGit = yield isGitHooks();

    debug(`run in git hooks: ${isGit}`);

    /**
     * 根据运行环境执行不同的文件遍历策略
     */
    let fileList;
    if (isGit) {
      fileList = yield stage(patterns);
    } else {
      fileList = local(patterns);
    }

    fillFileTree(fileTree, fileList);

    debug('fileList: %o', fileList);
    debug('fileTree: %o', fileTree);

    return fileTree;
  });
}

module.exports = walker;
