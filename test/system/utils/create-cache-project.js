'use strict'

const fs = require('fs-extra')
const run = require('./run')
const {
  cacheDir,
  testProjectDir,
  presetPkgPath,
  elintPkgPath
} = require('./variable')

// 创建缓存项目：方便后面重复使用
function createCacheProject () {
  if (fs.existsSync(cacheDir)) {
    fs.emptyDirSync(cacheDir)
  }

  // 创建缓存项目
  fs.copySync(testProjectDir, cacheDir)

  // 安装依赖
  run(`npm install ${presetPkgPath} ${elintPkgPath}`, cacheDir, true)
}

module.exports = createCacheProject
