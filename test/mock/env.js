'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');

let origin = process.env.INIT_CWD;

module.exports = function mock() {
  /**
   * 创建测试项目
   */
  const tempDir = path.join(os.tmpdir(), `elint_tmp_${Date.now()}`);
  const testProjectDir = path.join(__dirname, '../test-project');

  fs.ensureDirSync(tempDir);
  fs.copySync(testProjectDir, tempDir);

  /**
   * moch env.js baseDir
   */
  process.env.INIT_CWD = tempDir;

  return () => {
    fs.removeSync(tempDir);
    process.env.INIT_CWD = origin;
  };
};
