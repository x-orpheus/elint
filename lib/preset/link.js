'use strict';

const debug = require('debug')('elint:preset:link');
const findConfigFiles = require('./findConfigFiles');
const updateConfigFiles = require('./updateConfigFiles');

/**
 * 把各种 lint 的配置文件，移动到根目录
 */
function link(presetModulePath) {
  debug(`input ${presetModulePath}`);

  findConfigFiles(presetModulePath)
    .forEach(configFilePath => updateConfigFiles(configFilePath));
}

module.exports = link;
