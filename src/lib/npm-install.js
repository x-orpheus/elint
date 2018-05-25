'use strict';

const debug = require('debug')('elint:lib:npmInstall');
const exec = require('./exec');
const parse = require('../utils/parse-npm-option');

/**
 * @typedef InstallOptions
 * @property {string} prefix 安装路径
 * @property {boolean} saveDev --save-dev
 */

/**
 * npm install
 *
 * @param {Array<string>|string} names package name
 * @param {InstallOptions} options install options
 * @returns {Promise} promise
 */
function npmInstall(names, options) {
  const parsedNames = Array.isArray(names) ? names : [names];
  const parsedOptions = [];

  Object.entries(options).forEach(([option, value]) => {
    if (value === false) {
      return;
    }

    parsedOptions.push(parse(option));

    if (typeof value === 'string') {
      parsedOptions.push(value);
    }
  });

  if (options.prefix) {
    parsedOptions.unshift('--global');
  }

  const argus = [
    'install',
    ...parsedNames,
    ...parsedOptions
  ];

  debug(`run "npm ${argus.join(' ')}"`);

  return exec('npm')(...argus);
}

module.exports = npmInstall;
