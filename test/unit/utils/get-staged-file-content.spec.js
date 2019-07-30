'use strict'

const fs = require('fs-extra')
const path = require('path')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const getStagedFileContent = require('../../../src/utils/get-staged-file-content')
const { getBaseDir } = require('../../../src/env')

const deepEqualInAnyOrder = require('deep-equal-in-any-order')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(deepEqualInAnyOrder)
chai.use(chaiAsPromised)
chai.should()

let unmock
let baseDir

describe('get-staged-file-content 测试', function () {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  it('文件不存在', function () {
    const filePath = '/asdf/124/qwr/zvafafd/aqwer'
    return getStagedFileContent(filePath).should.eventually.deep.equal(null)
  })

  it('不是 staged 文件', function () {
    const fileName = 'untracked.js'
    const untrackedFilePath = path.join(baseDir, fileName)

    return gitInit()
      .then(() => fs.createFile(untrackedFilePath))
      .then(() => {
        return getStagedFileContent(fileName).should.eventually.deep.equal(null)
      })
  })

  it('是 staged 文件', function () {
    const filePath = 'app/style.css'
    const fileContent = fs.readFileSync(path.join(baseDir, filePath)).toString()

    return gitInit().then(() => {
      return getStagedFileContent(filePath).should.eventually.deep.equal(fileContent)
    })
  })
})
