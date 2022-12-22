import fs from 'fs-extra'
import mock from '../mock/env.js'
import getPath from '../mock/get-path.js'
import { getBaseDir } from '../../../src/env.js'
import walker from '../../../src/walker/index.js'
import gitInit from '../mock/git-init.js'
import appendFile from '../mock/append-file.js'

describe('Walker 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
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
      const result = ['src/a.js', 'src/lib/b.js'].map(getPath)

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
      const result = ['app/c.js', 'src/a.js', 'src/lib/b.js'].map(getPath)

      const expected = await walker(['**/*.js'], { cwd: baseDir })

      expect(expected).toIncludeSameMembers(result)
    })

    test('关闭忽略规则', async () => {
      const result = [
        'app/c.js',
        'src/a.js',
        'src/lib/b.js',
        'node_modules/elint-preset-node/index.js',
        'node_modules/elint-preset-node/.eslintrc.js',
        'node_modules/elint-preset-node/.stylelintrc.js',
        'node_modules/elint-preset-normal/index.js',
        'node_modules/elint-preset-normal/.eslintrc.js',
        'node_modules/elint-preset-normal/.stylelintrc.js',
        'node_modules/@scope/elint-preset-scope/index.js',
        'node_modules/@scope/elint-preset-scope/.eslintrc.js',
        'node_modules/@scope/elint-preset-scope/.stylelintrc.js',
        'node_modules/elint-plugin-esm/index.js',
        'node_modules/elint-plugin-cjs/index.js',
        'bower_components/a.js'
      ].map(getPath)

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
      const absFileName = getPath(fileName)

      await gitInit()

      const result = [
        getPath('src/a.js'),
        {
          filePath: absFileName,
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
      const absFileName1 = getPath(fileName1)

      const fileName2 = 'src/a.css'
      const absFileName2 = getPath(fileName2)

      await gitInit()

      const result = [
        getPath('src/a.js'),
        {
          filePath: absFileName1,
          fileContent: fs.readFileSync(absFileName1).toString()
        },
        {
          filePath: absFileName2,
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
