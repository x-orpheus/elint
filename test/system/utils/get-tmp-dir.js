'use strict';

const os = require('os');
const path = require('path');

function getTmpDir() {
  const testNo = Math.random().toString().substr(2);
  const tmpDir = path.join(os.tmpdir(), 'elint_test_system', testNo);

  return tmpDir;
}

module.exports = getTmpDir;
