'use strict'

const fs = require('fs-extra')
const getTmpDir = require('./get-tmp-dir')
const { cacheDir, cacheDirYarn } = require('./variable')

// 从缓存创建测试项目：依赖已经安装好，主要用于"功能"测试
function createTmpProjectFromCache (useYarn = false) {
  const tmpDir = getTmpDir()

  return fs.copy(useYarn ? cacheDirYarn : cacheDir, tmpDir).then(() => {
    return tmpDir
  })
}

module.exports = createTmpProjectFromCache
