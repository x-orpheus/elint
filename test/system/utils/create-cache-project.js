'use strict'

const fs = require('fs-extra')
const run = require('./run')
const {
  cacheDir,
  cacheDirYarn,
  backupDir,
  testProjectDir,
  presetPkgPath,
  elintPkgPath
} = require('./variable')

// 创建缓存项目：方便后面重复使用
async function createCacheProject (useYarn = false) {
  const dir = useYarn ? cacheDirYarn : cacheDir

  const dirExists = await fs.pathExists(dir)

  if (dirExists) {
    await fs.emptyDir(dir)
  }

  // 创建缓存项目
  await fs.copy(testProjectDir, dir)

  if (useYarn) {
    await run(`yarn add --silent ${presetPkgPath} ${elintPkgPath}`, dir)
  } else {
    await run(`npm install --silent ${presetPkgPath} ${elintPkgPath}`, dir)
  }

  // 创建备份
  await fs.copy(dir, backupDir, {
    filter: src => !src.includes('node_modules')
  })
}

module.exports = createCacheProject
