'use strict'

const fs = require('fs-extra')
const path = require('path')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const getStagedFileContent = require('../../../src/utils/get-staged-file-content')
const { getBaseDir } = require('../../../src/env')

let unmock
let baseDir

describe('get-staged-file-content 测试', () => {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  test('文件不存在', async () => {
    const filePath = '/asdf/124/qwr/zvafafd/aqwer'
    const expected = await getStagedFileContent(filePath)

    expect(expected).toEqual(null)
  })

  test('不是 staged 文件', async () => {
    const fileName = 'untracked.js'
    const untrackedFilePath = path.join(baseDir, fileName)

    await gitInit()
    await fs.createFile(untrackedFilePath)
    const expected = await getStagedFileContent(fileName)

    expect(expected).toEqual(null)
  })

  test('是 staged 文件', async () => {
    const filePath = 'app/style.css'
    const fileContent = await fs.readFile(path.join(baseDir, filePath))

    await gitInit()
    const expected = await getStagedFileContent(filePath)

    expect(expected).toEqual(fileContent.toString())
  })
})
