'use strict';

const execa = require('execa');

function worker(...argus) {
  return execa('node', argus);
};

module.exports = worker;
