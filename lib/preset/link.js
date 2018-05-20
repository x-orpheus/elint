'use strict';

const debug = require('debug')('elint:preset:link');
const findConfigFile = require('./findConfigFile');
const updateConfigFile = require('./updateConfigFile');

/**
 * 把各种 lint 的配置文件，移动到根目录
 */
function link(presetModulePath) {
  debug(`input ${presetModulePath}`);

  findConfigFile(presetModulePath)
    .forEach(configFilePath => updateConfigFile(configFilePath));
}

module.exports = link;
