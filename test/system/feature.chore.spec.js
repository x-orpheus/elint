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

  await t.notThrowsAsync(run('npm run version', tmpDir))
})

test('diff 存在差异文件', async t => {
  const tmpDir = t.context.tmpDir

  const elintrcPath = path.join(tmpDir, '.eslintrc.js')
  const elintrcOldPath = path.join(tmpDir, '.eslintrc.old.js')

  await fs.copy(elintrcPath, elintrcOldPath)
  await fs.appendFile(elintrcOldPath, 'console.log(1)')

  await t.notThrowsAsync(run('npm run diff', tmpDir))
})

test('diff 不存在差异文件', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run diff', tmpDir))
})

test('直接执行 elint，显示 help', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run(`node node_modules${path.sep}.bin${path.sep}elint`, tmpDir))
})
