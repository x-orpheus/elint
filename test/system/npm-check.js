'use strict';

const execa = require('execa');

/**
 * 仅用于 ci，如果 npm 在 5.4 至 5.6 之间，升级 npm
 */

if (!process.env.CI) {
  return;
}

const version = execa.sync('npm', ['-v']).stdout;
const versions = version.split('.');

if (versions[0] !== '5' || !['4', '5', '6'].includes(versions[1])) {
  return;
}

console.log('升级 npm');

if (process.platform === 'win32') {
  execa.sync('npm', ['install', 'npm', '-g']);
} else {
  execa.sync('sudo', ['npm', 'install', 'npm', '-g']);
}
