'use strict';

const debug = require('debug')('elint:walker');
const path = require('path');
const fg = require('fast-glob');
const { baseDir } = require('./env');

/**
 * file walker
 */
function walker(files, linter) {
  debug(`input glob patterns: ${files.join(', ')}`);
  debug('input linter: %o', linter);

  const fileList = fg.sync(files, {
    cwd: baseDir,
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

  debug(`%O`, fileTree);

  return fileTree;
}

module.exports = walker;
