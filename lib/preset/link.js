'use strict';

const debug = require('debug')('elint:preset:link');
const fs = require('fs-extra');
const path = require('path');
const isPlainObject = require('lodash/isPlainObject');
const { linterConfigFile } = require('../config');
const { baseDir } = require('../utils/env');

/**
 * 创建文件内容
 */
function createFileContent(obj) {
  return `"use strict";

module.exports = ${JSON.stringify(obj, null, '  ')};
`;
}

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

/**
 * 更新配置文件
 */
function updateConfigFile(filePath) {
  const fileParsedObj = path.parse(filePath);
  const fileName = `${fileParsedObj.name}${fileParsedObj.ext}`;
  const destFilePath = path.join(baseDir, fileName);
  const oldFilePath = path.join(
    baseDir,
    `${fileParsedObj.name}.old${fileParsedObj.ext}`
  );

  debug(`file path: ${filePath}`);
  debug(`file dest path: ${destFilePath}`);

  // 旧文件存在，rename
  if (fs.existsSync(destFilePath)) {
    debug('file exists, move.');
    debug(`file old name: ${oldFilePath}`);
    fs.moveSync(destFilePath, oldFilePath, { overwrite: true });
  }

  fs.copyFileSync(filePath, destFilePath);
}

/**
 * 把各种 lint 的配置文件，移动到根目录
 */
function link(presetModulePath) {
  debug(`input ${presetModulePath}`);

  findConfigFile(presetModulePath)
    .forEach(configFilePath => updateConfigFile(configFilePath));
}

module.exports = link;
