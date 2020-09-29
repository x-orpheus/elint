'use strict'

const fs = require('fs-extra')
const path = require('path')
const mock = require('../mock/env')
const gitInit = require('../mock/git-init')
const appendFile = require('../mock/append-file')
const stageFiles = require('../../../src/walker/stage')
const { getBaseDir } = require('../../../src/env')

let unmock
let baseDir

describe('Walker stage 测试', () => {
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

    const expected = []

    const result = await stageFiles(['**/*.js'])

    expect(result).toEqual(expected)
  })

  test('git 项目不存在', async () => {
    const expected = []

    const result = await stageFiles(['**/*.js'])

    expect(result).toEqual(expected)
  })

  test('可以匹配到文件', async () => {
    await gitInit()

    const result = ['src/a.js', 'src/lib/b.js']

    const expected = await stageFiles(['src/**/*.js'])

    expect(result).toIncludeSameMembers(expected)
  })

  test('匹配不到文件', async () => {
    await gitInit()

    const result = []

    const expected = await stageFiles(['*.txt'])

    expect(result).toEqual(expected)
  })

  test('忽略测试', async () => {
    await gitInit()

    const result = ['src/a.js']

    const expected = await stageFiles(['src/**/*.js'], ['src/lib/*'])

    expect(result).toEqual(expected)
  })

  test('忽略测试，规则为空', async () => {
    await gitInit()

    const result = ['src/a.js', 'src/lib/b.js']

    const expected = await stageFiles(['src/**/*.js'], [])

    expect(result).toIncludeSameMembers(expected)
  })

  test('包含非暂存区文件', async () => {
    const filePath = 'src/lib/b.js'
    const result = [
      'src/a.js',
      {
        fileName: filePath,
        fileContent: fs.readFileSync(path.join(baseDir, filePath)).toString()
      }
    ]

    await gitInit()

    await appendFile([filePath])

    const expected = await stageFiles(['src/**/*.js'], [])

    expect(expected).toEqual(result)
  })

  test('包含多个非暂存区文件', async () => {
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

    await gitInit()

    await appendFile([filePath1, filePath2])

    const expected = await stageFiles(
      ['src/**/*.js', 'app/**/*.js'],
      []
    )

    expect(result).toEqual(expected)
  })
})
