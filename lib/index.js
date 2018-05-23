'use strict';

const elint = require('./elint');
const install = require('./preset/install');
const diff = require('./preset/diff');
const commitlint = require('./linters/commitlint');
const { installHooks, uninstallHooks } = require('./hook');

module.exports = {
  elint,
  install,
  diff,
  commitlint,
  installHooks,
  uninstallHooks
};
