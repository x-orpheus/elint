import fs from 'fs-extra'
import path from 'path'
import mock from '../mock/env.js'
import gitInit from '../mock/git-init.js'
import appendFile from '../mock/append-file.js'
import stageFiles from '../../../src/walker/stage.js'
import { getBaseDir } from '../../../src/env.js'

describe('Walker stage 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('目录不存在', async () => {
    await fs.remove(baseDir)

    const expected: string[] = []

    const result = await stageFiles(['**/*.js'], undefined, baseDir)

    expect(result).toEqual(expected)
  })

  test('git 项目不存在', async () => {
    const expected: string[] = []

    const result = await stageFiles(['**/*.js'], undefined, baseDir)

    expect(result).toEqual(expected)
  })

  test('可以匹配到文件', async () => {
    await gitInit()

    const result = ['src/a.js', 'src/lib/b.js']

    const expected = await stageFiles(['src/**/*.js'], undefined, baseDir)

    expect(result).toIncludeSameMembers(expected)
  })

  test('匹配不到文件', async () => {
    await gitInit()

    const result: string[] = []

    const expected = await stageFiles(['*.txt'], undefined, baseDir)

    expect(result).toEqual(expected)
  })

  test('忽略测试', async () => {
    await gitInit()

    const result = ['src/a.js']

    const expected = await stageFiles(['src/**/*.js'], ['src/lib/*'], baseDir)

    expect(result).toEqual(expected)
  })

  test('忽略测试，规则为空', async () => {
    await gitInit()

    const result = ['src/a.js', 'src/lib/b.js']

    const expected = await stageFiles(['src/**/*.js'], [], baseDir)

    expect(result).toIncludeSameMembers(expected)
  })

  test('包含非暂存区文件', async () => {
    const filePath = 'src/lib/b.js'
    const result = [
      'src/a.js',
      {
        filePath,
        fileContent: fs.readFileSync(path.join(baseDir, filePath)).toString()
      }
    ]

    await gitInit()

    await appendFile([filePath])

    const expected = await stageFiles(['src/**/*.js'], [], baseDir)

    expect(expected).toEqual(result)
  })

  test('包含多个非暂存区文件', async () => {
    const filePath1 = 'src/lib/b.js'
    const filePath2 = 'app/c.js'
    const result = [
      'src/a.js',
      {
        filePath: filePath1,
        fileContent: fs.readFileSync(path.join(baseDir, filePath1)).toString()
      },
      {
        filePath: filePath2,
        fileContent: fs.readFileSync(path.join(baseDir, filePath2)).toString()
      }
    ]

    await gitInit()

    await appendFile([filePath1, filePath2])

    const expected = await stageFiles(
      ['src/**/*.js', 'app/**/*.js'],
      [],
      baseDir
    )

    expect(result).toEqual(expected)
  })
})
