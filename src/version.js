'use strict';

const pkg = require('../package.json');

/**
 * 输出 version
 *
 * @returns {void}
 */
function version() {
  const main = new Map();

  main.set('elint', pkg.version);
}

module.exports = version;
