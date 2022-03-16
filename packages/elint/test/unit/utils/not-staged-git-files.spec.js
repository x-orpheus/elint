'use strict'

const fs = require('fs-extra')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const appendFile = require('../mock/append-file')
const notStagedGitFiles = require('../../../src/utils/not-staged-git-files')
const { getBaseDir } = require('../../../src/env')

let unmock
let baseDir

describe('not-staged-git-files 测试', () => {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  test('目录不存在', async () => {
    await fs.remove(baseDir)
    const expected = await notStagedGitFiles()

    expect(expected).toEqual([])
  })

  test('没有 not staged file', async () => {
    const result = []

    await gitInit()

    const expected = await notStagedGitFiles()

    expect(expected).toEqual(result)
  })

  test('单个 staged file', async () => {
    const result = ['.huskyrc.js']

    await gitInit()
    await appendFile(result)

    const expected = await notStagedGitFiles()

    expect(expected).toEqual(result)
  })

  test('多个 staged file', async () => {
    const result = ['app/c.js', 'app/style.css']

    await gitInit()
    await appendFile(result)

    const expected = await notStagedGitFiles()

    expect(expected).toEqual(result)
  })
})
