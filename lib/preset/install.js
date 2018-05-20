'use strict';

const debug = require('debug')('elint:preset:install');
const log = require('../utils/log');
const normalize = require('./normalize');
const download = require('./download');
const link = require('./link');

function install(presetName, registryUrl) {
  debug(`install preset: ${presetName}`);
  debug(`registry url: ${registryUrl || 'default'}`);

  if (!presetName) {
    log.error('请输入 presetName.');
    process.exit(1);
  }

  const normalizePresetName = normalize(presetName);

  debug(`normalized preset name: ${normalizePresetName}`);

  download(normalizePresetName, registryUrl)
    .then(({ presetModuleName, presetModulePath }) => {
      debug(`preset module: ${presetModuleName}`);
      debug(`preset module path: ${presetModulePath}`);

      link(presetModulePath);
    })
    .catch(error => {
      console.log(error);
      process.exit(0);
    });
}

module.exports = install;
