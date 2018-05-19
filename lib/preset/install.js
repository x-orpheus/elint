'use strict';

const log = require('../utils/log');
const normalize = require('./normalize');
const download = require('./download');
const link = require('./link');

function install(presetName) {
  if (!presetName) {
    log.error('请输入 presetName.');
    process.exit(1);
  }

  const normalizePresetName = normalize(presetName);

  download(normalizePresetName)
    .then(({ presetModuleName, presetModulePath }) => {
      link(presetModulePath);
    })
    .catch(error => {
      console.log(error);
      process.exit(0);
    });
}

module.exports = install;
