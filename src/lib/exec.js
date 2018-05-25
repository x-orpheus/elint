'use strict';

const debug = require('debug')('elint:lib:exec');
const execa = require('execa');

const exec = pargram => (...argus) => {
  debug(`run: ${pargram} ${argus.join(' ')} --color`);
  return execa(pargram, [...argus, '--color']);
};

module.exports = exec;
