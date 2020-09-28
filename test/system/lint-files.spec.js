'use strict'

/**
 * lint 测试：主要测试直接 lint 文件
 */

const path = require('path')
const fs = require('fs-extra')
const resetCacheProject = require('./utils/reset-cache-project')
const run = require('./utils/run')

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()
})

test('lint', async () => {
  await expect(run('npm run lint-without-fix', tmpDir)).toReject()
})

test('lint --prettier', async () => {
  await expect(run('npm run lint-prettier-without-fix', tmpDir)).toReject()
})

test('lint --fix', async () => {
  await expect(run('npm run lint-fix', tmpDir)).toResolve()
})

test('lint --prettier --fix', async () => {
  await expect(run('npm run lint-prettier-fix', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 js 文件
 * 期望结果：不报错，仅显示 eslint pass
 */
test('lint only es', async () => {
  await expect(run('npm run lint-only-es', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 * 期望结果：不报错，仅显示 stylelint pass
 */
test('lint only style', async () => {
  await expect(run('npm run lint-only-style', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix --prettier，但是 glob 只有 js 文件
 * 期望结果：不报错，仅显示 eslint pass
 */
test('lint only es --prettier', async () => {
  await expect(run('npm run lint-only-es-prettier', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 * 期望结果：不报错，仅显示 stylelint pass
 */
test('lint only style --prettier', async () => {
  await expect(run('npm run lint-only-style-prettier', tmpDir)).toResolve()
})

test('lint --no-ignore', async () => {
  await expect(run('npm run lint-no-ignore', tmpDir)).toResolve()
})

test('lint es', async () => {
  await expect(run('npm run lint-es-without-fix', tmpDir)).toReject()
})

test('lint es with ignore', async () => {
  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  await fs.appendFile(eslintignorePath, '**/src/index.js')

  await expect(run('npm run lint-es-without-fix', tmpDir)).toResolve()
})

test('lint es --fix', async () => {
  await expect(run('npm run lint-es-fix', tmpDir)).toResolve()
})

test('lint style', async () => {
  await expect(run('npm run lint-style-without-fix', tmpDir)).toReject()
})

test('lint style with ignore', async () => {
  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  await fs.appendFile(stylelintignorePath, '**/src/index.css')

  return expect(run('npm run lint-style-without-fix', tmpDir)).toResolve()
})

test('lint style -f', async () => {
  await expect(run('npm run lint-style-fix', tmpDir)).toResolve()
})

test('lint es --prettier with ignore', async () => {
  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  await fs.appendFile(eslintignorePath, '**/src/index.js')

  const prettierignorePath = path.join(tmpDir, '.prettierignore')
  await fs.appendFile(prettierignorePath, '**/src/index.js')

  await expect(run('npm run lint-es-prettier-without-fix', tmpDir)).toResolve()
})

test('lint style --prettier with ignore', async () => {
  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  await fs.appendFile(stylelintignorePath, '**/src/index.css')

  const prettierignorePath = path.join(tmpDir, '.prettierignore')
  await fs.appendFile(prettierignorePath, '**/src/index.css')

  return expect(run('npm run lint-style-prettier-without-fix', tmpDir)).toResolve()
})
