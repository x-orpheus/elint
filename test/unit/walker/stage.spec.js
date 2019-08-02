'use strict'

const fs = require('fs-extra')
const path = require('path')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const appendFile = require('../mock/append-file')
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
    const result = ['src/a.js', 'src/lib/b.js']

    return gitInit().then(() => {
      return stageFiles(['src/**/*.js']).should.eventually.deep.equalInAnyOrder(result)
    })
  })

  it('匹配不到文件', function () {
    return gitInit().then(() => {
      return stageFiles(['*.txt']).should.eventually.deep.equalInAnyOrder([])
    })
  })

  it('忽略测试', function () {
    const result = ['src/a.js']

    return gitInit().then(() => {
      return stageFiles(['src/**/*.js'], ['src/lib/*']).should.eventually.deep.equalInAnyOrder(
        result
      )
    })
  })

  it('忽略测试，规则为空', function () {
    const result = ['src/a.js', 'src/lib/b.js']

    return gitInit().then(() => {
      return stageFiles(['src/**/*.js'], []).should.eventually.deep.equalInAnyOrder(result)
    })
  })

  it('包含非暂存区文件', function () {
    const filePath = 'src/lib/b.js'
    const result = [
      'src/a.js',
      {
        fileName: filePath,
        fileContent: fs.readFileSync(path.join(baseDir, filePath)).toString()
      }
    ]

    return gitInit()
      .then(() => appendFile([filePath]))
      .then(() => {
        return stageFiles(['src/**/*.js'], []).should.eventually.deep.equalInAnyOrder(result)
      })
  })

  it('包含多个非暂存区文件', function () {
    const filePath1 = 'src/lib/b.js'
    const filePath2 = 'app/c.js'
    const result = [
      'src/a.js',
      {
        fileName: filePath1,
        fileContent: fs.readFileSync(path.join(baseDir, filePath1)).toString()
      },
      {
        fileName: filePath2,
        fileContent: fs.readFileSync(path.join(baseDir, filePath2)).toString()
      }
    ]

    return gitInit()
      .then(() => appendFile([filePath1, filePath2]))
      .then(() => {
        return stageFiles(
          ['src/**/*.js', 'app/**/*.js'],
          []
        ).should.eventually.deep.equalInAnyOrder(result)
      })
  })
})
