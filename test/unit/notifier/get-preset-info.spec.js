'use strict'

const path = require('path')
const fs = require('fs-extra')
const mock = require('../mock/env')
const { getBaseDir } = require('../../../src/env')
const getPresetInfo = require('../../../src/notifier/get-preset-info')

const chai = require('chai')
const should = chai.should()

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
  fs.removeSync(path.join(getBaseDir(), p))
}

describe('GetPresetInfo 测试', function () {
  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  it('未安装 preset', function () {
    // 删除 node_modules 和 package-lock
    remove('node_modules')
    remove('package-lock.json')

    return should.not.exist(getPresetInfo())
  })

  it('从 package-lock.json 中获取数据', function () {
    // 删除 elint-preset-node 和 @scope/elint-preset-scope
    remove('node_modules/elint-preset-node')
    remove('node_modules/@scope/elint-preset-scope')

    return getPresetInfo().should.be.deep.equal(normalPresetInfo)
  })

  it('[scope] 从 package-lock.json 中获取数据', function () {
    // 删除 elint-preset-node 和 elint-preset-normal
    remove('node_modules/elint-preset-node')
    remove('node_modules/elint-preset-normal')

    return getPresetInfo().should.be.deep.equal(scopePresetInfo)
  })

  it('从 node_modules 中获取数据', function () {
    // 删除 elint-preset-node， @scope/elint-preset-scope, package-lock.json
    remove('node_modules/elint-preset-node')
    remove('node_modules/@scope/elint-preset-scope')
    remove('package-lock.json')

    return getPresetInfo().should.be.deep.equal(normalPresetInfo)
  })

  it('[scope] 从 node_modules 中获取数据', function () {
    // 删除 elint-preset-node， elint-preset-normal, package-lock.json
    remove('node_modules/elint-preset-node')
    remove('node_modules/elint-preset-normal')
    remove('package-lock.json')

    return getPresetInfo().should.be.deep.equal(scopePresetInfo)
  })

  it('_resolved 缺失', function () {
    // 删除 elint-preset-normal @scope/elint-preset-scope, package-lock.json
    remove('node_modules/elint-preset-normal')
    remove('node_modules/@scope/elint-preset-scope')
    remove('package-lock.json')

    return should.not.exist(getPresetInfo())
  })
})
