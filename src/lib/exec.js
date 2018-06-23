'use strict';

const debug = require('debug')('elint:lib:exec');
const execa = require('execa');

const exec = pargram => (...argus) => {
  debug(`run: ${pargram} ${argus.join(' ')}`);

  const env = Object.assign({}, process.env, {
    FORCE_COLOR: true
  });

  return execa(pargram, [...argus], {
    env
  });
};

module.exports = exec;
