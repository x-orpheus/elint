'use strict';

const debug = require('debug')('elint:walker:local');
const fs = require('fs');
const path = require('path');
const co = require('co');
const globby = require('globby');
const ignore = require('ignore');
const { defaultIgnore } = require('../config');
const { getBaseDir } = require('../env');

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
 * 本地文件遍历
 *
 * @param {Array<string>} [patterns] 匹配模式
 * @param {object} [options] 配置
 * @returns {Array<string>} file list
 */
function walker(patterns = [], options = {}) {
  const baseDir = getBaseDir();
  const noIgnore = typeof options.noIgnore === 'boolean'
    ? options.noIgnore
    : false; // 默认不禁用 ignore 规则

  return co(function* () {
    let fileList = yield globby(patterns, {
      cwd: baseDir,
      gitignore: !noIgnore,
      dot: true,
      onlyFiles: true,
      absolute: true
    });

    if (!noIgnore) {
      const ignoreRules = getIgnore();
      const ignoreFilter = ignore().add(ignoreRules).createFilter();

      debug('ignore rules: %j', ignoreRules);

      fileList = fileList.filter(ignoreFilter);
    }

    return fileList;
  });
}

module.exports = walker;
