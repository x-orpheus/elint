'use strict'

const os = require('os')
const path = require('path')
const { version } = require('../../../package.json')

// 测试项目
const testProjectDir = path.join(__dirname, '../test-project')

// 缓存目录
const cacheDir = path.join(os.tmpdir(), 'elint_test_system', 'cache')
const cacheDirYarn = path.join(os.tmpdir(), 'elint_test_system', 'cache-yarn')

// 备份目录
const backupDir = path.join(os.tmpdir(), 'elint_test_system', 'backup')

// elint
const elintPath = path.join(__dirname, '../../../')
const elintPkgPath = path.join(elintPath, `elint-${version}.tgz`)

// preset
const presetPath = path.join(__dirname, '../test-preset')
const presetPkgPath = path.join(presetPath, 'elint-preset-system-test-1.0.0.tgz')

module.exports = {
  testProjectDir,
  cacheDir,
  cacheDirYarn,
  backupDir,
  elintPath,
  elintPkgPath,
  presetPath,
  presetPkgPath
}
