'use strict'

const fs = require('fs-extra')
const run = require('./run')
const {
  cacheDir,
  cacheDirYarn,
  testProjectDir,
  presetPkgPath,
  elintPkgPath
} = require('./variable')

// 创建缓存项目：方便后面重复使用
function createCacheProject (useYarn = false) {
  const dir = useYarn ? cacheDirYarn : cacheDir
  if (fs.existsSync(dir)) {
    fs.emptyDirSync(dir)
  }

  // 创建缓存项目
  fs.copySync(testProjectDir, dir)

  if (useYarn) {
    run(`yarn add --silent ${presetPkgPath} ${elintPkgPath}`, dir, true)
  } else {
    // 安装依赖
    run(`npm install --silent ${presetPkgPath} ${elintPkgPath}`, dir, true)
  }
}

module.exports = createCacheProject
