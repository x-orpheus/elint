'use strict';

const debug = require('debug')('elint:preset:download');
const npmi = require('npmi');
const { baseDir } = require('../env');

/**
 * @typedef DownloadResult
 * @property {string} presetModuleName preset name
 * @property {string} presetModulePath preset absolute path
 */

/**
 * 下载 npm 包（npm install）
 *
 * @param {string} presetName preset name
 * @param {string} version 版本
 * @param {string} registryUrl 指定 registry
 * @returns {Promise<DownloadResult>} result
 */
function download(presetName, version, registryUrl) {
  const npmOptions = {
    path: baseDir,
    name: presetName,
    version: version || 'latest',
    forceInstall: true,
    progress: false,
    npmLoad: {
      'save-dev': true,
      'package-lock': false,
      loglevel: 'info'
    }
  };

  if (registryUrl) {
    npmOptions.npmLoad.registry = registryUrl;
    npmOptions.npmLoad.force = true;
  }

  debug('npm install options: %o', npmOptions);

  return new Promise((resolve, reject) => {
    npmi(npmOptions, function (error, moduleContent) {
      if (error) {
        return reject(error);
      }

      const result = {
        presetModuleName: moduleContent[0][0],
        presetModulePath: moduleContent[0][1]
      };

      debug('download module: %o', result);

      return resolve(result);
    });
  });
}

module.exports = download;
