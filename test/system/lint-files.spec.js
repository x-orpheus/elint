'use strict'

/**
 * lint 测试：主要测试直接 lint 文件
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

test('lint --prettier', async t => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('npm run lint-prettier-without-fix', tmpDir))
})

test('lint --fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-fix', tmpDir))
})

test('lint --prettier --fix', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-prettier-fix', tmpDir))
})

/**
 * 执行 lint --fix，但是 glob 只有 js 文件
 * 期望结果：不报错，仅显示 eslint pass
 */
test('lint only es', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-only-es', tmpDir))
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 * 期望结果：不报错，仅显示 stylelint pass
 */
test('lint only style', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-only-style', tmpDir))
})

/**
 * 执行 lint --fix --prettier，但是 glob 只有 js 文件
 * 期望结果：不报错，仅显示 eslint pass
 */
test('lint only es --prettier', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-only-es-prettier', tmpDir))
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 * 期望结果：不报错，仅显示 stylelint pass
 */
test('lint only style --prettier', async t => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('npm run lint-only-style-prettier', tmpDir))
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

test('lint es --prettier with ignore', async t => {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  await fs.appendFile(eslintignorePath, '**/src/index.js')

  const prettierignorePath = path.join(tmpDir, '.prettierignore')
  await fs.appendFile(prettierignorePath, '**/src/index.js')

  await t.notThrowsAsync(run('npm run lint-es-prettier-without-fix', tmpDir))
})

test('lint style --prettier with ignore', async t => {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  await fs.appendFile(stylelintignorePath, '**/src/index.css')

  const prettierignorePath = path.join(tmpDir, '.prettierignore')
  await fs.appendFile(prettierignorePath, '**/src/index.css')

  return t.notThrowsAsync(run('npm run lint-style-prettier-without-fix', tmpDir))
})
