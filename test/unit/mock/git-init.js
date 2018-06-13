'use strict';

const co = require('co');
const execa = require('execa');
const { getBaseDir } = require('../../../src/env');

function gitInit() {
  const options = {
    cwd: getBaseDir()
  };

  return co(function* () {
    yield execa('git', ['init'], options);
    yield execa('git', ['add', '.'], options);
  });
}

module.exports = gitInit;
