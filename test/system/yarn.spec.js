'use strict'

/**
 * 使用 yarn 的测试
 */

const resetCacheProject = require('./utils/reset-cache-project')
const run = require('./utils/run')
const hasYarn = require('./utils/has-yarn')

let tmpDir

const testIfCondition = hasYarn() ? test : test.skip

beforeEach(async () => {
  tmpDir = await resetCacheProject(true)
})

testIfCondition('yarn: lint', async () => {
  await expect(run('yarn lint-without-fix', tmpDir)).toReject()
})

testIfCondition('yarn: lint --prettier', async () => {
  await expect(run('yarn lint-prettier-without-fix', tmpDir)).toReject()
})

testIfCondition('yarn: lint --fix', async () => {
  await expect(run('yarn lint-fix', tmpDir)).toReslove()
})
