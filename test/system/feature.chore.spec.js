'use strict'

/**
 * 杂项测试
 */

const test = require('ava')
const path = require('path')
const fs = require('fs-extra')
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

test('diff 存在差异文件', async t => {
  const tmpDir = t.context.tmpDir

  const elintrcPath = path.join(tmpDir, '.eslintrc.js')
  const elintrcOldPath = path.join(tmpDir, '.eslintrc.old.js')

  await fs.copy(elintrcPath, elintrcOldPath)
  await fs.appendFile(elintrcOldPath, 'console.log(1)')

  await t.notThrowsAsync(run('npm run elint-diff', tmpDir))
})

test('diff 不存在差异文件', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run elint-diff', tmpDir))
})

test('直接执行 elint，显示 help', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run(`npm run elint`, tmpDir))
})

test('elint --help', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run(`npm run elint-help`, tmpDir))
})

test('elint 执行无效命令', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run(`npm run elint-invalid-command`, tmpDir))
})

test('elint 执行无效选项', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run(`npm run elint-invalid-option`, tmpDir))
})
