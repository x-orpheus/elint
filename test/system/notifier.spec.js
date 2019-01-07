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

const test = require('ava')
const createTmpProject = require('./utils/create-tmp-project')
const run = require('./utils/run')
const { elintPkgPath } = require('./utils/variable')

test.beforeEach(async t => {
  const tmpDir = await createTmpProject()

  /**
   * 设置 configstore 的目录
   * https://github.com/yeoman/configstore
   */
  process.env.XDG_DATA_HOME = tmpDir

  t.context.tmpDir = tmpDir
})

test('安装 latest，没有更新提示', async t => {
  const tmpDir = t.context.tmpDir

  await run(`npm install ${elintPkgPath}`, tmpDir)
  await run(`npm install elint-preset-test@latest`, tmpDir, false, false)

  // 不显示更新提示
  await t.notThrowsAsync(run('npm run lint-fix', tmpDir))
})

test('安装 1.2.0，有更新提示', async t => {
  const tmpDir = t.context.tmpDir

  await run(`npm install ${elintPkgPath}`, tmpDir)
  await run(`npm install elint-preset-test@1.2.0`, tmpDir, false, false)

  // 不显示更新提示
  await t.notThrowsAsync(run('npm run lint-fix', tmpDir))
})
