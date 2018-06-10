'use strict';

const debug = require('debug')('elint:walker:local');
const fs = require('fs');
const path = require('path');
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

const aaaaaa = 1;

/**
 * 本地文件遍历
 *
 * @param {Array<string>} patterns 匹配模式
 * @returns {Array<string>} file list
 */
function walker(patterns) {
  const baseDir = getBaseDir();
  const ignoreRules = getIgnore();
  debug('ignore rules: %j', ignoreRules);

  const ignoreFilter = ignore().add(ignoreRules).createFilter();

  return globby
    .sync(patterns, {
      cwd: baseDir,
      gitignore: true,
      dot: true,
      onlyFiles: true,
      absolute: true
    })
    .filter(ignoreFilter);
}

module.exports = walker;
