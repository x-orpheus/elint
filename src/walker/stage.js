'use strict';

const debug = require('debug')('elint:walker:stage');
const fs = require('fs-extra');
const path = require('path');
const minimatch = require('minimatch');
const sgf = require('staged-git-files');
const { getBaseDir } = require('../env');

/**
 * 执行 minimatch
 *
 * @param {string} filename 文件名
 * @param {Array<string>} patterns 匹配模式
 * @returns {boolean} 是否匹配
 */
function match(filename, patterns) {
  return patterns.some(pattern => {
    return minimatch(filename, pattern, {
      dot: true
    });
  });
}

/**
 * Git 暂存文件遍历
 *
 * @param {Array<string>} patterns 要搜寻的 glob 数组
 * @returns {Promise<object>} fileTree
 */
function stageFiles(patterns) {
  const baseDir = getBaseDir();

  // 如果 baseDir 根本不存在 sgf 会抛出异常
  if (!fs.existsSync(baseDir)) {
    return Promise.resolve([]);
  }

  sgf.cwd = baseDir;

  return new Promise(resolve => {
    sgf((err, result) => {
      if (err) {
        debug('staged-git-files error: %o', err);
        return resolve([]);
      }

      const fileList = result
        .filter(item => match(item.filename, patterns))
        .map(item => path.join(baseDir, item.filename));

      resolve(fileList);
    });
  });
}

module.exports = stageFiles;
