'use strict';

const debug = require('debug')('elint:utils:get-config-file');
const cosmiconfig = require('cosmiconfig');
const { getBaseDir } = require('../env');
const moduleName = 'elint';

function getConfigFile() {
  const explorer = cosmiconfig(moduleName, {
    searchPlaces: [
      'package.json',
      `.${moduleName}rc.js`
    ]
  });

  const baseDir = getBaseDir();
  const result = explorer.searchSync(baseDir);

  debug('config file: %o', result);

  return result;
}

module.exports = getConfigFile;
