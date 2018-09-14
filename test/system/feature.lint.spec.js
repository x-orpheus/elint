'use strict'

/**
 * lint 测试
 */

const { test, beforeEach } = require('ava')
const path = require('path')
const fs = require('fs-extra')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')

beforeEach(function * (t) {
  const tmpDir = yield createTmpProjectFromCache()
  t.context.tmpDir = tmpDir
})

test('lint', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.throws(run('npm run lint-without-fix', tmpDir))
})

test('lint --fix', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-fix', tmpDir))
})

test('lint --force-fix', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-force-fix', tmpDir))
})

test('lint --no-ignore', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-no-ignore', tmpDir))
})

test('lint es', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.throws(run('npm run lint-es-without-fix', tmpDir))
})

test('lint es with ignore', function * (t) {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore')
  yield fs.appendFile(eslintignorePath, '**/src/index.js')

  yield t.notThrows(run('npm run lint-es-without-fix', tmpDir))
})

test('lint es --fix', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-es-fix', tmpDir))
})

test('lint es --force-fix', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-es-force-fix', tmpDir))
})

test('lint style', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.throws(run('npm run lint-style-without-fix', tmpDir))
})

test('lint style with ignore', function * (t) {
  const tmpDir = t.context.tmpDir

  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  yield fs.appendFile(stylelintignorePath, '**/src/index.css')

  return t.notThrows(run('npm run lint-style-without-fix', tmpDir))
})

test('lint style -f', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-style-fix', tmpDir))
})

test('lint style -ff', function * (t) {
  const tmpDir = t.context.tmpDir

  yield t.notThrows(run('npm run lint-style-force-fix', tmpDir))
})
