'use strict'

/**
 * 使用 yarn 的测试
 */

const test = require('ava')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')
const hasYarn = require('./utils/has-yarn')

test.serial.before('test if yarn exists', async (t) => {
  t.true(hasYarn())
})

test.serial.before(async (t) => {
  const tmpDir = await createTmpProjectFromCache(hasYarn())
  t.context.tmpDir = tmpDir
})

test.serial('yarn: lint', async (t) => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('yarn lint-without-fix', tmpDir))
})

test.serial('yarn: lint --prettier', async (t) => {
  const tmpDir = t.context.tmpDir

  await t.throwsAsync(run('yarn lint-prettier-without-fix', tmpDir))
})

test.serial('yarn: lint --fix', async (t) => {
  const tmpDir = t.context.tmpDir

  await t.notThrowsAsync(run('yarn lint-fix', tmpDir))
})
