'use strict';

const debug = require('debug')('elint:utils:stage-files');
const path = require('path');
const minimatch = require('minimatch');
const sgf = require('staged-git-files');
const { baseDir } = require('../env');
const { linterSuffix } = require('../config');

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
 * @typedef FileTree
 * @property {string[]} es 要提供给 eslint 的文件数组
 * @property {string[]} style 要提供给 stylelint 的文件数组
 */

/**
 * file walker
 *
 * @param {string[]} files 要搜寻的 glob 数组
 * @returns {Promise<FileTree>} fileTree
 */
function stageFiles(files) {
  debug(`input glob patterns: ${files}`);
  debug('config linterSuffix: %o', linterSuffix);

  const fileTree = {};
  Object.keys(linterSuffix).forEach(linterName => {
    fileTree[linterName] = [];
  });

  if (!files || (Array.isArray(files) && !files.length)) {
    return fileTree;
  }

  return new Promise(resolve => {
    sgf((err, result) => {
      if (err) {
        debug('sgf error: %o', err);
        return resolve(fileTree);
      }

      const fileList = result
        .filter(item => match(item.filename, files))
        .map(item => path.join(baseDir, item.filename));

      let extname;
      fileList.forEach(filePath => {
        extname = path.extname(filePath);

        Object.keys(linterSuffix).some(linterName => {
          if (linterSuffix[linterName].includes(extname)) {
            fileTree[linterName].push(filePath);
            return true;
          }

          return false;
        });
      });

      debug('fileTree: %o', fileTree);

      resolve(fileTree);
    });
  });
}

module.exports = stageFiles;
