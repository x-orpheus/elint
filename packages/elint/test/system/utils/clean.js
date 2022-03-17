'use strict'

/**
 * 执行一些清理工作
 */

const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const { globbySync } = require('globby')

module.exports = () => {
  // CI 下不用执行清理
  if (process.env.CI) {
    process.exit(0)
  }

  const tmpDir = os.tmpdir()

  /**
   * 清理临时目录
   */
  const dir = path.join(tmpDir, 'elint_test_system')

  if (fs.existsSync(dir)) {
    fs.removeSync(dir)
  }

  /**
   * 清理 npm pack 文件
   */
  const packFiles = globbySync('elint-*.tgz', {
    cwd: process.cwd(),
    onlyFiles: true,
    absolute: true
  })

  packFiles.forEach((filePath) => {
    fs.removeSync(filePath)
  })
}
