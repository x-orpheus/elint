'use strict';

const debug = require('debug')('elint:walker');
const path = require('path');
const globby = require('globby');
const { baseDir } = require('./env');
const { linter, defaultIgnore } = require('../config');

/**
 * file walker
 */
function walker(files) {
  debug(`input glob patterns: ${files.join(', ')}`);
  debug('config linter: %o', linter);

  const fileList = globby.sync(files, {
    cwd: baseDir,
    ignore: defaultIgnore,
    gitignore: true,
    dot: true,
    onlyFiles: true,
    absolute: true
  });

  debug('matched files: \n%O', fileList);

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

  debug('%O', fileTree);

  return fileTree;
}

module.exports = walker;
