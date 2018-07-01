'use strict';

const fs = require('fs-extra');
const getTmpDir = require('./get-tmp-dir');
const { cacheDir } = require('./variable');

// 从缓存创建测试项目：依赖已经安装好，主要用于"功能"测试
function createTmpProjectFromCache() {
  const tmpDir = getTmpDir();

  return fs.copy(cacheDir, tmpDir).then(() => {
    return tmpDir;
  });
}

module.exports = createTmpProjectFromCache;
