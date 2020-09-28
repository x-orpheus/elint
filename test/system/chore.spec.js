'use strict'

/**
 * 杂项测试
 */

const resetCacheProject = require('./utils/reset-cache-project')
const run = require('./utils/run')

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()
})

test('version', async () => {
  await expect(run('npm run elint-version', tmpDir)).toResolve()
})

test('直接执行 elint，显示 help', async () => {
  await expect(run('npm run elint', tmpDir)).toResolve()
})

test('elint --help', async () => {
  await expect(run('npm run elint-help', tmpDir)).toResolve()
})

test('elint 执行无效命令', async () => {
  await expect(run('npm run elint-invalid-command', tmpDir)).toReject()
})

test('elint 执行无效选项', async () => {
  await expect(run('npm run elint-invalid-option', tmpDir)).toReject()
})
