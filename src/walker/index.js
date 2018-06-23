'use strict';

const debug = require('debug')('elint:walker');
const fs = require('fs-extra');
const path = require('path');
const co = require('co');
const ignore = require('ignore');
const isGitHooks = require('../utils/is-git-hooks');
const { defaultIgnore } = require('../config');
const { getBaseDir } = require('../env');
const { getFileTree, fillFileTree } = require('./filetree');
const local = require('./local');
const stage = require('./stage');

/**
 * 获取 ignore 规则
 *
 * @returns {Array<string>} ignore rules
 */
function getIgnore() {
  const baseDir = getBaseDir();
  const ignoreFilePath = path.join(baseDir, '.elintignore');

  // .elintignore 不存在，使用默认忽略规则
  if (!fs.existsSync(ignoreFilePath)) {
    debug(`${ignoreFilePath} was not found, use default.`);
    return defaultIgnore;
  }

  const fileContent = fs.readFileSync(ignoreFilePath, 'utf-8');

  // .elintignore 存在，但是为空，等同于没有忽略规则
  if (!fileContent || !fileContent.trim()) {
    debug('.elintignore is empty.');
    return [];
  }

  return fileContent.split(/\r?\n/);
}

/**
 * 文件遍历
 *
 * @param {Array<string>} patterns 匹配模式
 * @param {object} [options] 配置
 * @returns {Promise<object>} file tree
 */
function walker(patterns, options = {}) {
  debug(`input glob patterns: ${patterns}`);
  debug(`input options: ${options}`);

  const fileTree = getFileTree();
  const noIgnore = typeof options.noIgnore === 'boolean'
    ? options.noIgnore
    : false; // 默认不禁用 ignore 规则

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
      fileList = yield local(patterns);
    }

    if (!noIgnore) {
      const ignoreRules = getIgnore();
      const ignoreFilter = ignore().add(ignoreRules).createFilter();

      debug('ignore rules: %j', ignoreRules);

      fileList = fileList.filter(ignoreFilter);
    }

    fillFileTree(fileTree, fileList);

    debug('fileList: %o', fileList);
    debug('fileTree: %o', fileTree);

    return fileTree;
  });
}

module.exports = walker;
