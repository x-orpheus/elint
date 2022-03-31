import fs from 'fs-extra'
import path from 'path'
import mock from '../mock/env.js'
import gitInit from '../mock/git-init.js'
import getStagedFileContent from '../../../src/utils/get-staged-file-content.js'
import { getBaseDir } from '../../../src/env.js'

describe('get-staged-file-content 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('文件不存在', async () => {
    const filePath = '/asdf/124/qwr/zvafafd/aqwer'
    const expected = await getStagedFileContent(filePath, baseDir)

    expect(expected).toEqual(null)
  })

  test('不是 staged 文件', async () => {
    const fileName = 'untracked.js'
    const untrackedFilePath = path.join(baseDir, fileName)

    await gitInit()
    await fs.createFile(untrackedFilePath)
    const expected = await getStagedFileContent(fileName, baseDir)

    expect(expected).toEqual(null)
  })

  test('是 staged 文件', async () => {
    const filePath = 'app/style.css'
    const fileContent = await fs.readFile(path.join(baseDir, filePath))

    await gitInit()
    const expected = await getStagedFileContent(filePath, baseDir)

    expect(expected).toEqual(fileContent.toString())
  })
})
