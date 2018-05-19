'use strict';

const debug = require('debug')('elint:walker');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const ignore = require('ignore');
const { baseDir } = require('./env');
const { linterSuffix, defaultIgnore } = require('../config');

/**
 * 获取 ignore 规则
 */
function getIgnore() {
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
 * file walker
 */
function walker(files) {
  debug(`input glob patterns: ${files}`);
  debug('config linterSuffix: %o', linterSuffix);

  const fileTree = {};
  Object.keys(linterSuffix).forEach(linterName => {
    fileTree[linterName] = [];
  });

  if (!files || (Array.isArray(files) && !files.length)) {
    return fileTree;
  }

  const ignoreRules = getIgnore();
  debug('ignore rules: %j', ignoreRules);

  const ignoreFilter = ignore().add(ignoreRules).createFilter();
  const fileList = globby
    .sync(files, {
      cwd: baseDir,
      gitignore: true,
      dot: true,
      onlyFiles: true,
      absolute: true
    })
    .filter(ignoreFilter);

  debug('matched files: %o', fileList);

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

  return fileTree;
}

module.exports = walker;
