'use strict';

const execa = require('execa');

function worker(...argus) {
  return execa('node', [...argus, '--color']);
}

module.exports = worker;
