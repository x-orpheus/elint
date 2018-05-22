'use strict';

const debug = require('debug')('elint:preset:install');
const log = require('../utils/log');
const { registryAlias } = require('../config');
const normalize = require('./normalize');
const download = require('./download');
const link = require('./link');

/**
 * 取 install 使用的 registry
 */
function getRegistryUrl(registry) {
  return registryAlias[registry] || registry;
}

function install(presetName, options) {
  debug(`install preset: ${presetName}`);
  debug(`install options: ${options}`);

  if (!presetName) {
    log.error('请输入 presetName.');
    process.exit(1);
  }

  const registryUrl = getRegistryUrl(options.registry);
  const keep = options.keep;

  // registryUrl 存在但是不合法
  if (registryUrl && !/^https?:\/\//.test(registryUrl)) {
    log.error('registry must be a full url with http(s)://');
    process.exit(1);
  }

  const normalizePresetName = normalize(presetName);

  debug(`normalized preset name: ${normalizePresetName}`);

  download(normalizePresetName, registryUrl)
    .then(({ presetModuleName, presetModulePath }) => {
      debug(`preset module: ${presetModuleName}`);
      debug(`preset module path: ${presetModulePath}`);

      link(presetModulePath, keep);
    })
    .catch(error => {
      console.log(error);
      process.exit(0);
    });
}

module.exports = install;
