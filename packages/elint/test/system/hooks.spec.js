/**
 * hooks 相关测试
 */

import resetCacheProject from './utils/reset-cache-project.js'
import run from './utils/run.js'
import initHusky from './utils/init-husky.js'

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()

  await run('git init', tmpDir)
  await run('git config user.name "zhang san"', tmpDir)
  await run('git config user.email "zhangsan@gmail.com"', tmpDir)
  await run('git commit --allow-empty -m "build: initial empty commit"', tmpDir)

  await run('npm run hooks-install', tmpDir)
})

afterEach(async () => {
  await run('npm run hooks-uninstall', tmpDir)
})

/**
 * 不合法的 git commit message
 */
test('lint commit test(error)', async () => {
  await run('git add package.json', tmpDir)

  await expect(
    run('git commit -m "lint commit test(error)"', tmpDir)
  ).toReject()
})

/**
 * 合法的 git commit message
 */
test('lint commit test(success)', async () => {
  await run('git add package.json', tmpDir)

  await expect(
    run('git commit -m "build: lint commit test(success)"', tmpDir)
  ).toResolve()
})

/**
 * 在 git hooks 中执行 lint，lint 的文件符合规范
 */
test('lint stage files', async () => {
  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)

  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await expect(
    run('git commit -m "build: lint stage files"', tmpDir)
  ).toResolve()
})

/**
 * 在 git hooks 中执行 npm script，npm script 中执行 lint
 * lint 的文件符合规范
 */
test('lint stage files(deep)', async () => {
  // 添加符合规范的文件
  await run('git add src/standard2.css', tmpDir)

  await initHusky('npm run lint-only-css-without-fix', tmpDir)

  // 只校验 stage 文件，不报错
  await expect(
    run('git commit -m "build: lint stage files(deep)"', tmpDir)
  ).toResolve()
})

/**
 * 在 git hooks 中执行 lint，lint 的文件不符合规范
 */
test('lint stage files(error)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  // 报错
  await expect(
    run('git commit -m "build: lint stage files(error)"', tmpDir)
  ).toReject()
})

test('lint stage files(fix)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  await initHusky('npm run elint lint "src/**/*" -- --fix', tmpDir)

  // 报错，因为 fix 在 git hooks 中无效
  await expect(
    run('git commit -m "build: lint stage files(fix)"', tmpDir)
  ).toReject()
})
