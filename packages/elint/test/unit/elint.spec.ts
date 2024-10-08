import path from 'node:path'
import fs from 'fs-extra'
import { lintCommon, lintText, lintFiles } from '../../src/elint.js'
import { getBaseDir } from '../../src/env.js'
import mock from './mock/env.js'
import {
  mockElintPlugin,
  mockElintPreset,
  mockElintPresetWithAllTypePlugins,
  mockElintPresetWithOverridePluginConfig
} from './mock/mocks.js'
import gitInit from './mock/git-init.js'
import appendFile from './mock/append-file.js'
import { loadPresetAndPlugins } from '../../src/core/load.js'
import { ElintPluginType, reset } from '../../src/index.js'

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

  describe('loadPresetAndPlugins', () => {
    test('正常加载', async () => {
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: 'elint-preset-normal',
        cwd: baseDir
      })

      expect(internalLoadedPresetAndPlugins).not.toBeUndefined()
      expect(internalLoadedPresetAndPlugins.internalPlugins).toHaveLength(2)
    })

    test('preset 内未指定 plugin', async () => {
      await expect(
        loadPresetAndPlugins({ preset: 'elint-preset-node', cwd: baseDir })
      ).toReject()
    })

    test('项目中有多个 preset', async () => {
      await expect(loadPresetAndPlugins()).toReject()
    })

    test('覆盖 plugin 配置', async () => {
      // 覆盖插件配置
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: mockElintPresetWithOverridePluginConfig,
        cwd: baseDir
      })

      expect(
        internalLoadedPresetAndPlugins.internalPlugins[0].plugin.activateConfig
          .extensions
      ).toIncludeSameMembers(['.ts'])
    })
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

  describe('reset', () => {
    test('reset', async () => {
      const errorMap = await reset({
        preset: mockElintPreset
      })

      expect(errorMap).toBeEmpty()
    })

    test('reset with error', async () => {
      const errorMap = await reset({
        cwd: baseDir,
        preset: {
          plugins: [
            {
              ...mockElintPlugin,
              reset: () => {
                throw new Error()
              }
            }
          ]
        }
      })

      expect(errorMap[mockElintPlugin.name]).not.toBeUndefined()
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
