'use strict';

const debug = require('debug')('elint:walker');
const co = require('co');
const path = require('path');
const ignore = require('ignore');
const isGitHooks = require('../utils/is-git-hooks');
const getConfigFile = require('../utils/get-config-file');
const { getBaseDir } = require('../env');
const { defaultIgnore } = require('../config');
const { getFileTree, fillFileTree } = require('./filetree');
const local = require('./local');
const stage = require('./stage');

/**
 * 获取 ignore 规则
 *
 * @returns {Array<string>} ignore rules
 */
function getIgnore() {
  const configFile = getConfigFile();

  /**
   * 使用默认忽略规则：
   * 1、配置文件不存在
   * 2、配置文件存在，但是为空
   * 3、配置文件存在，不为空，但是没有 ignore 属性
   *
   * 也就是只要没有明确指定 ignore，都是用默认规则
   */
  if (!configFile || (configFile && !configFile.config)
    || (configFile && configFile.config && !configFile.config.ignore)) {
    debug('use default ignore rule.');
    return defaultIgnore;
  }

  const ignoreRules = configFile.config.ignore;

  if (!Array.isArray(ignoreRules)) {
    return [];
  }

  return ignoreRules;
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
  debug('input options: %o', options);

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

    // 转为绝对路径
    const baseDir = getBaseDir();
    fileList = fileList.map(p => {
      return path.join(baseDir, p);
    });

    fillFileTree(fileTree, fileList);

    debug('fileList: %o', fileList);
    debug('fileTree: %o', fileTree);

    return fileTree;
  });
}

module.exports = walker;
