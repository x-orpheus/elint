import fs from 'fs-extra'
import mock from '../mock/env.js'
import gitInit from '../mock/git-init.js'
import appendFile from '../mock/append-file.js'
import notStagedGitFiles from '../../../src/utils/not-staged-git-files.js'
import { getBaseDir } from '../../../src/env.js'

describe('not-staged-git-files 测试', () => {
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
    const expected = await notStagedGitFiles(baseDir)

    expect(expected).toEqual([])
  })

  test('没有 not staged file', async () => {
    const result: string[] = []

    await gitInit()

    const expected = await notStagedGitFiles(baseDir)

    expect(expected).toEqual(result)
  })

  test('单个 staged file', async () => {
    const result = ['app/c.js']

    await gitInit()
    await appendFile(result)

    const expected = await notStagedGitFiles(baseDir)

    expect(expected).toEqual(result)
  })

  test('多个 staged file', async () => {
    const result = ['app/c.js', 'app/style.css']

    await gitInit()
    await appendFile(result)

    const expected = await notStagedGitFiles(baseDir)

    expect(expected).toEqual(result)
  })
})
