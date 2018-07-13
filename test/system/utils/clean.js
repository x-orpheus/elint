'use strict'

/**
 * 执行一些清理工作
 */

const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const tmpDir = os.tmpdir()

// 清理临时目录
const dir = path.join(tmpDir, 'elint_test_system')

if (fs.existsSync(dir)) {
  fs.removeSync(dir)
}
