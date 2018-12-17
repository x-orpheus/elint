'use strict'

/**
 * lint 测试
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

test('lint', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run lint-without-fix', tmpDir))
})

test('lint --fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-fix', tmpDir))
})

test('lint --force-fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-force-fix', tmpDir))
})

test('lint --no-ignore', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-no-ignore', tmpDir))
})

test('lint es', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run lint-es-without-fix', tmpDir))
})

test('lint es with ignore', async t => {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  await fs.appendFile(eslintignorePath, '**/src/index.js')

  await t.notThrowsAsync(run('npm run lint-es-without-fix', tmpDir))
})

test('lint es --fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-es-fix', tmpDir))
})

test('lint es --force-fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-es-force-fix', tmpDir))
})

test('lint style', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run lint-style-without-fix', tmpDir))
})

test('lint style with ignore', async t => {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  await fs.appendFile(stylelintignorePath, '**/src/index.css')

  return t.notThrowsAsync(run('npm run lint-style-without-fix', tmpDir))
})

test('lint style -f', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-style-fix', tmpDir))
})

test('lint style -ff', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-style-force-fix', tmpDir))
})
