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

  const result = {};
  let fileName;

  Object.keys(linterConfigFile).forEach(linterName => {
    fileName = linterConfigFile[linterName];

    if (fileList.includes(fileName)) {
      result[linterName] = path.join(dir, fileName);
    }
  });

  debug('config file: %o', result);

  return result;
}

/**
 * 更新配置文件
 */
function updateConfigFile(linterName, pathOrContent) {
  const fileName = linterConfigFile[linterName];
  const destFilePath = path.join(baseDir, fileName);
  const fileParsedObj = path.parse(fileName);
  const oldFilePath = path.join(
    baseDir,
    `${fileParsedObj.name}.old${fileParsedObj.ext}`
  );

  debug(`file name: ${fileName}`);
  debug(`file dest path: ${destFilePath}`);
  debug(`file old name: ${oldFilePath}`);

  // 旧文件存在，rename
  if (fs.existsSync(destFilePath)) {
    debug('file exists, move.');
    fs.moveSync(destFilePath, oldFilePath, { overwrite: true });
  }

  if (typeof pathOrContent === 'string'
    && path.isAbsolute(pathOrContent)) {
    debug('input file path, copy.');
    fs.copyFileSync(pathOrContent, baseDir);
    return;
  }

  debug('input file content, create.');
  const fileContent = createFileContent(pathOrContent);

  fs.outputFileSync(destFilePath, fileContent);
}

/**
 * 把各种 lint 的配置文件，移动到根目录
 */
function link(presetModulePath) {
  // eslint-disable-next-line global-require
  const presetModule = require(presetModulePath);

  debug('preset module: %o', presetModule);

  /**
   * preset 默认输出了 linter 的配置
   */
  if (isPlainObject(presetModule)) {
    debug('preset module is plain object');

    Object.keys(linterConfigFile).forEach(linterName => {
      if (isPlainObject(presetModule[linterName])) {
        debug(`module.${linterName} is plain object`);
        updateConfigFile(linterName, presetModule[linterName]);
      }
    });

    return;
  }

  debug('preset module isn\'t plain object');

  // preset 没有输出 linter 配置，根目录下找配置文件
  const configFiles = findConfigFile(presetModulePath);
  Object.entries(configFiles).forEach(argus => {
    updateConfigFile(...argus);
  });
}

module.exports = link;
