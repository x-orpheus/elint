'use strict'

/**
 * hooks 相关测试
 */

const { test, beforeEach } = require('ava')
const path = require('path')
const fs = require('fs-extra')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')

beforeEach(function * (t) {
  const tmpDir = yield createTmpProjectFromCache()

  yield run('git init', tmpDir)
  yield run('git config user.name "zhang san"', tmpDir)
  yield run('git config user.email "zhangsan@gmail.com"', tmpDir)

  const hooksPath = path.join(tmpDir, '.git/hooks')

  t.context = {
    tmpDir,
    hooksPath
  }
})

test('hooks install && uninstall', function * (t) {
  const { tmpDir, hooksPath } = t.context
  let hooks

  yield run('npm run hooks-uninstall', tmpDir)

  hooks = yield fs.readdir(hooksPath)
  t.is(hooks.filter(p => !p.includes('.sample')).length, 0)

  yield run('npm run hooks-install', tmpDir)

  hooks = yield fs.readdir(hooksPath)
  t.not(hooks.filter(p => !p.includes('.sample')).length, 0)
})

test('lint commtest(error)', function * (t) {
  const { tmpDir } = t.context

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  yield run('npm run hooks-install', tmpDir)
  yield run('git add package.json', tmpDir)

  yield t.throws(run('git commit -m "hello"', tmpDir))
})

test('lint commtest(success)', function * (t) {
  const { tmpDir } = t.context

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  yield run('npm run hooks-install', tmpDir)
  yield run('git add package.json', tmpDir)

  yield t.notThrows(run('git commit -m "build: hello"', tmpDir))
})
