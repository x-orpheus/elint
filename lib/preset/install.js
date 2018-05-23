'use strict';

const debug = require('debug')('elint:preset:install');
const log = require('../utils/log');
const parse = require('../utils/parse-package-name');
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

function install(name, options) {
  debug(`install package name: ${name}`);
  debug('install options: %o', options);

  const presetNameObj = parse(name);

  debug('preset name object: %o', presetNameObj);

  if (!presetNameObj) {
    log.error('请输入正确的 presetName.');
    process.exit(1);
  }

  const presetName = presetNameObj.name;
  const version = presetNameObj.version;
  const scope = presetNameObj.scope;
  const registryUrl = getRegistryUrl(options.registry);
  const keep = options.keep;

  // registryUrl 存在但是不合法
  if (registryUrl && !/^https?:\/\//.test(registryUrl)) {
    log.error('registry must be a full url with http(s)://');
    process.exit(1);
  }

  const normalizedPresetName = normalize(presetName, scope);

  debug(`normalized preset name: ${normalizedPresetName}`);

  download(normalizedPresetName, version, registryUrl)
    .then(({ presetModuleName, presetModulePath }) => {
      debug(`preset module: ${presetModuleName}`);
      debug(`preset module path: ${presetModulePath}`);

      link(presetModulePath, keep);
    })
    .catch(error => {
      log.error(error.message);
      process.exit(1);
    });
}

module.exports = install;
