'use strict'

const fs = require('fs-extra')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const appendFile = require('../mock/append-file')
const notStagedGitFiles = require('../../../src/utils/not-staged-git-files')
const { getBaseDir } = require('../../../src/env')

const deepEqualInAnyOrder = require('deep-equal-in-any-order')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(deepEqualInAnyOrder)
chai.use(chaiAsPromised)
chai.should()

let unmock
let baseDir

describe('not-staged-git-files 测试', function () {
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
    return notStagedGitFiles().should.eventually.deep.equal([])
  })

  it('没有 not staged file', function () {
    const result = []

    return gitInit().then(() => {
      return notStagedGitFiles().should.eventually.deep.equal(result)
    })
  })

  it('单个 staged file', function () {
    const result = ['.huskyrc.js']

    return gitInit()
      .then(() => appendFile(result))
      .then(() => {
        return notStagedGitFiles().should.eventually.deep.equal(result)
      })
  })

  it('多个 staged file', function () {
    const result = ['app/c.js', 'app/style.css']

    return gitInit()
      .then(() => appendFile(result))
      .then(() => {
        return notStagedGitFiles().should.eventually.deep.equal(result)
      })
  })
})
