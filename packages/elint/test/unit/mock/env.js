'use strict'

const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const origin = process.env.INIT_CWD

module.exports = function mock () {
  /**
   * 创建测试项目
   */
  const tempDir = path.join(
    os.tmpdir(),
    `elint_tmp_${Math.random().toString().substr(2)}`
  )

  const testProjectDir = path.join(__dirname, '../test-project')

  fs.ensureDirSync(tempDir)
  fs.copySync(testProjectDir, tempDir)

  /**
   * moch env.js baseDir
   */
  process.env.INIT_CWD = tempDir

  return () => {
    fs.removeSync(tempDir)
    process.env.INIT_CWD = origin
  }
}
