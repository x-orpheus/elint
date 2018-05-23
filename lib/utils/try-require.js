'use strict';

const debug = require('debug')('elint:utils:try-require');
const fs = require('fs');
const { nodeModulesDir } = require('../env');

/**
 * 尝试获取已安装的模块，返回模块名
 *
 * @param {RegExp} regexp
 * @returns {string[]}
 */
module.exports = function tryRequire(regexp) {
  const results = [];

  debug(`arguments.regexp: ${regexp || 'undefined'}`);

  if (!regexp || !fs.existsSync(nodeModulesDir)) {
    debug('regexp is undefined or nodeModulesDir not exists');
    return results;
  }

  const moduleList = fs
    .readdirSync(nodeModulesDir)
    .filter(m => regexp.test(m));

  debug(`matched modules: ${moduleList.join(', ')}`);

  return moduleList;
};
