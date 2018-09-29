'use strict'

const fs = require('fs-extra')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const stageFiles = require('../../../src/walker/stage')
const { getBaseDir } = require('../../../src/env')

const deepEqualInAnyOrder = require('deep-equal-in-any-order')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(deepEqualInAnyOrder)
chai.use(chaiAsPromised)
chai.should()

let unmock
let baseDir

describe('Walker stage 测试', function () {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  it('目录不存在', function () {
    fs.removeSync(baseDir)
    return stageFiles(['**/*.js']).should.eventually.deep.equal([])
  })

  it('git 项目不存在', function () {
    return stageFiles(['**/*.js']).should.eventually.deep.equal([])
  })

  it('可以匹配到文件', function () {
    const result = [
      'src/a.js',
      'src/lib/b.js'
    ]

    return gitInit()
      .then(() => {
        return stageFiles(['src/**/*.js']).should.eventually.deep.equalInAnyOrder(result)
      })
  })

  it('匹配不到文件', function () {
    return gitInit()
      .then(() => {
        return stageFiles(['*.txt']).should.eventually.deep.equalInAnyOrder([])
      })
  })

  it('忽略测试', function () {
    const result = [
      'src/a.js'
    ]

    return gitInit()
      .then(() => {
        return stageFiles(['src/**/*.js'], ['src/lib/*'])
          .should.eventually.deep.equalInAnyOrder(result)
      })
  })

  it('忽略测试，规则为空', function () {
    const result = [
      'src/a.js',
      'src/lib/b.js'
    ]

    return gitInit()
      .then(() => {
        return stageFiles(['src/**/*.js'], [])
          .should.eventually.deep.equalInAnyOrder(result)
      })
  })
})
