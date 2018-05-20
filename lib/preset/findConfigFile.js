'use strict';

const debug = require('debug')('elint:preset:findConfigFile');
const fs = require('fs-extra');
const path = require('path');
const { linterConfigFile } = require('../config');

/**
 * 在指定目录下搜寻全部配置文件
 */
function findConfigFile(dir) {
  const fileList = fs.readdirSync(dir);

  debug(`${dir} file list: %o`, fileList);

  const result = linterConfigFile
    .filter(fileName => fileList.includes(fileName))
    .map(fileName => path.join(dir, fileName));

  debug('config file: %o', result);

  return result;
}

module.exports = findConfigFile;
