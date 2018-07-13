'use strict'

const fs = require('fs-extra')
const getTmpDir = require('./get-tmp-dir')
const { testProjectDir } = require('./variable')

// 创建空的测试项目：主要用于"安装"测试
function createTmpProject () {
  const tmpDir = getTmpDir()

  // 创建测试项目
  return fs.copy(testProjectDir, tmpDir).then(() => {
    return tmpDir
  })
}

module.exports = createTmpProject
