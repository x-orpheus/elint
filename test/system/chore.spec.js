'use strict'

/**
 * 杂项测试
 */

const test = require('ava')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')

test.beforeEach(async t => {
  const tmpDir = await createTmpProjectFromCache()
  t.context.tmpDir = tmpDir
})

test('version', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run elint-version', tmpDir))
})

test('直接执行 elint，显示 help', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run elint', tmpDir))
})

test('elint --help', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run elint-help', tmpDir))
})

test('elint 执行无效命令', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run elint-invalid-command', tmpDir))
})

test('elint 执行无效选项', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run elint-invalid-option', tmpDir))
})
