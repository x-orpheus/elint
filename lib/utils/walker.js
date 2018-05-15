'use strict';

const debug = require('debug')('elint:walker');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const isValidGlob = require('is-valid-glob');
const { baseDir } = require('./env');
const { linter, defaultIgnore } = require('../config');

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

  return fileContent
    .split(/\r?\n/)
    .filter(line => isValidGlob(line));
}

/**
 * file walker
 */
function walker(files) {
  debug(`input glob patterns: ${files.join(', ')}`);
  debug('config linter: %o', linter);

  const ignore = getIgnore();
  debug('ignore: %j', ignore);

  const fileList = globby.sync(files, {
    cwd: baseDir,
    ignore,
    gitignore: true,
    dot: true,
    onlyFiles: true,
    absolute: true
  });

  debug('matched files: %o', fileList);

  const fileTree = {};
  let extname;

  Object.keys(linter).forEach(linterName => {
    fileTree[linterName] = [];
  });

  fileList.forEach(filePath => {
    extname = path.extname(filePath);

    Object.keys(linter).some(linterName => {
      if (linter[linterName].includes(extname)) {
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
