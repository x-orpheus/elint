import path from 'node:path'
import fs from 'fs-extra'
import { lintCommon, lintText, lintFiles } from '../../src/elint.js'
import { getBaseDir } from '../../src/env.js'
import mock from './mock/env.js'
import {
  mockElintPlugin,
  mockElintPreset,
  mockElintPresetWithAllTypePlugins
} from './mock/mocks.js'
import gitInit from './mock/git-init.js'
import appendFile from './mock/append-file.js'
import { ElintPluginType } from '../../src/index.js'

describe('elint core', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  describe('lintCommon', () => {
    test('有 common 类型插件', async () => {
      const result = await lintCommon({
        preset: mockElintPresetWithAllTypePlugins,
        cwd: baseDir
      })

      expect(result.pluginResults).toHaveLength(1)
      expect(result.pluginResults[0].pluginData.type).toBe(
        ElintPluginType.Common
      )
    })

    test('无 common 类型插件', async () => {
      const result = await lintCommon({
        preset: mockElintPreset,
        fix: true
      })

      expect(result.pluginResults).toHaveLength(0)
    })
  })

  describe('lintText', () => {
    test('文本检测流程', async () => {
      const result = await lintText('input', {
        preset: mockElintPresetWithAllTypePlugins
      })

      expect(
        result.pluginResults.map((result) => result.pluginData.type)
      ).toStrictEqual([
        ElintPluginType.Linter,
        ElintPluginType.Formatter,
        ElintPluginType.Formatter
      ])
    })

    test('没有 formatter 时不检查格式', async () => {
      const result = await lintText('input', {
        preset: {
          ...mockElintPresetWithAllTypePlugins,
          plugins: mockElintPresetWithAllTypePlugins.plugins.slice(1)
        },
        cwd: baseDir
      })

      expect(
        result.pluginResults.map((result) => result.pluginData.type)
      ).toStrictEqual([ElintPluginType.Linter])
    })

    test('无 linter 或 formatter 检测', async () => {
      const result = await lintText('input', {
        preset: {
          ...mockElintPresetWithAllTypePlugins,
          plugins: mockElintPresetWithAllTypePlugins.plugins.filter((plugin) =>
            typeof plugin === 'string'
              ? true
              : plugin.type === ElintPluginType.Common
          )
        },
        cwd: baseDir
      })

      expect(result.pluginResults).toHaveLength(0)
    })
  })
})

describe('lintFiles', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('文件检测流程', async () => {
    const result = await lintFiles(['src/a.js'], {
      preset: mockElintPresetWithAllTypePlugins
    })

    expect(result).toHaveLength(1)
  })

  test('二进制文件检测时不读取文件内容', async () => {
    const result = await lintFiles(['src/a.png'], {
      preset: mockElintPresetWithAllTypePlugins
    })

    expect(result).toHaveLength(1)
    expect(result[0].pluginResults).toHaveLength(0)
    expect(result[0].isBinary).toBe(true)
    expect(result[0].source).toBe('')
  })

  test('命中缓存', async () => {
    const result = await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins,
      cache: true
    })

    expect(result).toHaveLength(1)
    expect(result[0].fromCache).not.toBeTrue()

    const resultWithCache = await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins,
      cache: true
    })

    expect(resultWithCache).toHaveLength(1)
    expect(resultWithCache[0].fromCache).toBeTrue()
  })

  test('未找到文件', async () => {
    const result = await lintFiles(['xxx/xxx.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins
    })

    expect(result).toBeEmpty()
  })

  test('fix 写入', async () => {
    await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: {
        ...mockElintPresetWithAllTypePlugins,
        plugins: [
          ...mockElintPresetWithAllTypePlugins.plugins,
          {
            ...mockElintPlugin,
            name: 'elint-plugin-mock-custom',
            execute(text) {
              return {
                errorCount: 0,
                warningCount: 0,
                source: text,
                output: 'test'
              }
            }
          }
        ]
      },
      fix: true
    })

    const filePath = path.join(baseDir, 'src/a.js')

    expect(fs.readFileSync(filePath, 'utf-8')).toBe('test')
  })

  test('包含 staged file', async () => {
    await gitInit()

    const fileName = 'src/a.js'
    const filePath = path.join(baseDir, fileName)

    // 更新文件
    await appendFile([fileName])

    const fileContentNew = fs.readFileSync(filePath, 'utf-8')

    const result = await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins,
      git: true
    })

    expect(fileContentNew).not.toBe(result[0].output)
  })

  test('在 git 暂存区且发生修改的文件不会命中缓存', async () => {
    const result = await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins,
      cache: true
    })

    expect(result[0].fromCache).not.toBeTrue()

    await gitInit()

    await appendFile(['src/a.js'])

    const resultWithCache = await lintFiles(['src/a.js'], {
      cwd: baseDir,
      preset: mockElintPresetWithAllTypePlugins,
      cache: true,
      git: true
    })

    expect(resultWithCache[0].fromCache).not.toBeTrue()
  })
})
