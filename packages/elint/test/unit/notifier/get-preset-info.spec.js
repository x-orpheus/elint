'use strict'

const path = require('path')
const fs = require('fs-extra')
const mock = require('../mock/env')
const { getBaseDir } = require('../../../src/env')
const getPresetInfo = require('../../../src/notifier/get-preset-info')

let unmock

const normalPresetInfo = {
  name: 'elint-preset-normal',
  version: '1.0.0',
  registryUrl: 'https://registry.npmjs.fromlock.org'
}

const scopePresetInfo = {
  name: '@scope/elint-preset-scope',
  version: '1.0.0',
  registryUrl: 'https://registry.npmjs.fromlock.org'
}

function remove (p) {
  return fs.remove(path.join(getBaseDir(), p))
}

describe('GetPresetInfo 测试', () => {
  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  test('从 package-lock.json 中获取数据', async () => {
    // 删除 elint-preset-node 和 @scope/elint-preset-scope
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/@scope/elint-preset-scope')

    expect(getPresetInfo()).toEqual(normalPresetInfo)
  })

  test('[scope] 从 package-lock.json 中获取数据', async () => {
    // 删除 elint-preset-node 和 elint-preset-normal
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/elint-preset-normal')

    expect(getPresetInfo()).toEqual(scopePresetInfo)
  })

  test('从 node_modules 中获取数据', async () => {
    // 删除 elint-preset-node， @scope/elint-preset-scope, package-lock.json
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/@scope/elint-preset-scope')
    await remove('package-lock.json')

    expect(getPresetInfo()).toEqual(normalPresetInfo)
  })

  test('[scope] 从 node_modules 中获取数据', async () => {
    // 删除 elint-preset-node， elint-preset-normal, package-lock.json
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/elint-preset-normal')
    await remove('package-lock.json')

    expect(getPresetInfo()).toEqual(scopePresetInfo)
  })

  test('未安装 preset', async () => {
    // 删除 node_modules 和 package-lock
    await remove('node_modules')
    await remove('package-lock.json')

    expect(getPresetInfo()).toBeFalsy()
  })

  test('_resolved 缺失', async () => {
    // 删除 elint-preset-normal @scope/elint-preset-scope, package-lock.json
    await remove('node_modules/elint-preset-normal')
    await remove('node_modules/@scope/elint-preset-scope')
    await remove('package-lock.json')

    expect(getPresetInfo()).toBeFalsy()
  })

  test('package-lock 中不存在 preset 信息', async () => {
    // 删除 elint-preset-node 和 @scope/elint-preset-scope
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/@scope/elint-preset-scope')

    // 删除 package-lock 中 elint-preset-normal 的信息
    const packageLockPath = path.join(getBaseDir(), 'package-lock.json')
    const packageLockContent = `{
      "dependencies": {}
    }`

    await fs.writeFile(packageLockPath, packageLockContent)

    expect(getPresetInfo()).toEqual(normalPresetInfo)
  })

  test('本地安装，resolved 非 url', async () => {
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/@scope/elint-preset-scope')

    const packageLockPath = path.join(getBaseDir(), 'package-lock.json')
    const packageLockContent = `{
      "dependencies": {
        "elint-preset-normal": {
          "version": "1.0.0",
          "resolved": "/home/a/b/c"
        }
      }
    }`

    await fs.writeFile(packageLockPath, packageLockContent)

    expect(getPresetInfo()).toBeFalsy()
  })

  test('package.json 缺失', async () => {
    // 删除 elint-preset-node， @scope/elint-preset-scope, package-lock.json
    await remove('node_modules/elint-preset-node')
    await remove('node_modules/@scope/elint-preset-scope')
    await remove('package-lock.json')

    // package.json 缺失（虽然不知道为什么会缺失）
    await remove('node_modules/elint-preset-normal/package.json')

    expect(getPresetInfo()).toBeFalsy()
  })
})
