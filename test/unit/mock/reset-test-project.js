'use strict';

/**
 * reset test project
 */

const path = require('path');
const fs = require('fs-extra');
const { getBaseDir } = require('../../../src/env');
const testProjectDir = path.join(__dirname, '../test-project');

module.exports = function () {
  const baseDir = getBaseDir();
  fs.emptyDirSync(baseDir);
  fs.copySync(testProjectDir, baseDir);
};
