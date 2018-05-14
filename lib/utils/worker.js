'use strict';

const debug = require('debug')('elint:utils:worker');
const execa = require('execa');

function worker(...argus) {
  debug(`run: node ${argus.join(' ')} --color`);
  return execa('node', [...argus, '--color']);
}

module.exports = worker;
