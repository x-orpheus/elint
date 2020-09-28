'use strict'

/**
 * 更新检查测试
 *
 * 使用 elint-preset-test 测试更新检查功能
 * v1.2.0 开始，package.json 加入 elint 配置：
 *
 *  v1.2.0
 *  v1.2.1
 *  v1.3.0
 *  v2.0.0
 */

const resetCacheProject = require('./utils/reset-cache-project')
const run = require('./utils/run')
const { elintPkgPath } = require('./utils/variable')

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()
})

test('安装 latest，没有更新提示', async () => {
  await run(`npm install --silent ${elintPkgPath}`, tmpDir)
  await run('npm install --silent elint-preset-test@latest', tmpDir)

  // 不显示更新提示
  await expect(run('npm run lint-fix', tmpDir, false, false)).toResolve()
})

test('安装 3.0.0，有更新提示', async () => {
  await run(`npm install --silent ${elintPkgPath}`, tmpDir)
  await run('npm install --silent elint-preset-test@3.0.0', tmpDir)

  // 显示更新提示
  await expect(run('npm run lint-fix', tmpDir, false, false)).toResolve()
})
