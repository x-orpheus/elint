/**
 * lint 测试：主要测试直接 lint 文件
 */

import path from 'path'
import fs from 'fs-extra'
import resetCacheProject from './utils/reset-cache-project.js'
import run from './utils/run.js'

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()
})

test('lint', async () => {
  await expect(run('npm run lint-without-fix', tmpDir)).toReject()
})

test('lint --style', async () => {
  await expect(run('npm run lint-style-without-fix', tmpDir)).toReject()
})

test('lint --fix', async () => {
  await expect(run('npm run lint-fix', tmpDir)).toResolve()
})

test('lint --style --fix', async () => {
  await expect(run('npm run lint-style-fix', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 js 文件
 */
test('lint only js', async () => {
  await expect(run('npm run lint-only-js', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 */
test('lint only css', async () => {
  await expect(run('npm run lint-only-css', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix --style glob 只有 js 文件
 */
test('lint only js --style', async () => {
  await expect(run('npm run lint-only-js-style', tmpDir)).toResolve()
})

/**
 * 执行 lint --fix，但是 glob 只有 css 文件
 */
test('lint only css --style', async () => {
  await expect(run('npm run lint-only-css-style', tmpDir)).toResolve()
})

test('lint --no-ignore', async () => {
  await expect(run('npm run lint-no-ignore', tmpDir)).toResolve()
})

test('lint js', async () => {
  await expect(run('npm run lint-only-js-without-fix', tmpDir)).toReject()
})

test('lint js with ignore', async () => {
  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  await fs.appendFile(eslintignorePath, '**/src/index.js')

  await expect(run('npm run lint-only-js-without-fix', tmpDir)).toResolve()
})

test('lint css', async () => {
  await expect(run('npm run lint-only-css-without-fix', tmpDir)).toReject()
})

test('lint css with ignore', async () => {
  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  await fs.appendFile(stylelintignorePath, '**/src/index.css')

  return expect(run('npm run lint-only-css-without-fix', tmpDir)).toResolve()
})

// test('lint style -f', async () => {
//   await expect(run('npm run lint-style-fix', tmpDir)).toResolve()
// })

// test('lint es --prettier with ignore', async () => {
//   // 忽略有问题的文件
//   const eslintignorePath = path.join(tmpDir, '.eslintignore')
//   await fs.appendFile(eslintignorePath, '**/src/index.js')

//   const prettierignorePath = path.join(tmpDir, '.prettierignore')
//   await fs.appendFile(prettierignorePath, '**/src/index.js')

//   await expect(run('npm run lint-es-prettier-without-fix', tmpDir)).toResolve()
// })

// test('lint style --prettier with ignore', async () => {
//   // 忽略有问题的文件
//   const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
//   await fs.appendFile(stylelintignorePath, '**/src/index.css')

//   const prettierignorePath = path.join(tmpDir, '.prettierignore')
//   await fs.appendFile(prettierignorePath, '**/src/index.css')

//   return expect(
//     run('npm run lint-style-prettier-without-fix', tmpDir)
//   ).toResolve()
// })
