'use strict';

const path = require('path');
const worker = require('./utils/worker');
const pragram = require.resolve('husky/lib/installer/bin');

function installHooks() {
  worker(pragram, 'install');
}

function uninstallHooks() {
  worker(pragram, 'uninstall');
}

module.exports = {
  installHooks,
  uninstallHooks
};
