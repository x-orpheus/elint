import path from 'path'
import fs from 'fs-extra'
import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import walker from '../../../src/walker/index.js'
import gitInit from '../mock/git-init.js'
import appendFile from '../mock/append-file.js'

describe('Walker 测试', () => {
  let unmock: () => void
  let baseDir: string
  let getPath: (p: string) => string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
    getPath = (p) => {
      return path.join(p)
    }
  })

  afterEach(() => {
    unmock()
  })

  describe('功能测试', () => {
    test('空测试', async () => {
      const result: string[] = []
      const expected = await walker([], { cwd: baseDir })

      expect(expected).toEqual(result)
    })

    test('普通环境', async () => {
      const result: string[] = []

      const expected = await walker(['*.txt'], { cwd: baseDir })

      expect(expected).toEqual(result)
    })

    test('git 环境：匹配不到', async () => {
      const result: string[] = []

      const expected = await walker(['*.txt'], { cwd: baseDir, git: true })

      expect(expected).toEqual(result)
    })

    test('git 环境：可以匹配到', async () => {
      const result = [getPath('src/a.js'), getPath('src/lib/b.js')]

      await gitInit()

      const expected = await walker(['src/**/*.js'], {
        cwd: baseDir,
        git: true
      })

      expect(expected).toIncludeSameMembers(result)
    })
  })

  describe('Ignore 功能测试', () => {
    test('开启忽略规则', async () => {
      const result = [
        getPath('app/c.js'),
        getPath('src/a.js'),
        getPath('src/lib/b.js')
      ]

      const expected = await walker(['**/*.js'], { cwd: baseDir })

      expect(expected).toIncludeSameMembers(result)
    })

    test('关闭忽略规则', async () => {
      const result = [
        getPath('app/c.js'),
        getPath('src/a.js'),
        getPath('src/lib/b.js'),
        getPath('node_modules/elint-preset-node/index.js'),
        getPath('node_modules/elint-preset-node/.eslintrc.js'),
        getPath('node_modules/elint-preset-node/.stylelintrc.js'),
        getPath('node_modules/elint-preset-normal/index.js'),
        getPath('node_modules/elint-preset-normal/.eslintrc.js'),
        getPath('node_modules/elint-preset-normal/.stylelintrc.js'),
        getPath('node_modules/@scope/elint-preset-scope/index.js'),
        getPath('node_modules/@scope/elint-preset-scope/.eslintrc.js'),
        getPath('node_modules/@scope/elint-preset-scope/.stylelintrc.js'),
        getPath('node_modules/elint-plugin-esm/index.js'),
        getPath('node_modules/elint-plugin-cjs/index.js'),
        getPath('bower_components/a.js')
      ]

      const expected = await walker(['**/*.js'], {
        noIgnore: true,
        cwd: baseDir
      })

      expect(expected).toIncludeSameMembers(result)
    })
  })

  describe('staged file 测试', () => {
    test('包含 staged file', async () => {
      const fileName = 'src/lib/b.js'
      const absFileName = path.join(baseDir, fileName)

      await gitInit()

      const result = [
        getPath('src/a.js'),
        {
          filePath: fileName,
          fileContent: fs.readFileSync(absFileName).toString()
        }
      ]

      // 更新文件
      await appendFile([fileName])

      const expected = await walker(['src/**/*.js'], {
        cwd: baseDir,
        git: true
      })

      expect(expected).toIncludeSameMembers(result)
    })

    test('包含多个 staged file', async () => {
      const fileName1 = 'src/lib/b.js'
      const absFileName1 = path.join(baseDir, fileName1)
      const fileName2 = 'src/a.css'
      const absFileName2 = path.join(baseDir, fileName2)

      await gitInit()

      const result = [
        getPath('src/a.js'),
        {
          filePath: fileName1,
          fileContent: fs.readFileSync(absFileName1).toString()
        },
        {
          filePath: fileName2,
          fileContent: fs.readFileSync(absFileName2).toString()
        }
      ]

      await appendFile([fileName1, fileName2])

      const expected = await walker(['src/**/*.+(js|css)'], {
        cwd: baseDir,
        git: true
      })

      expect(expected).toIncludeSameMembers(result)
    })
  })
})
