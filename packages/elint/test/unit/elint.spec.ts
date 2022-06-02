import path from 'path'
import fs from 'fs-extra'
import {
  lintCommon,
  loadPresetAndPlugins,
  reset,
  lintText,
  lintFiles
} from '../../src/elint.js'
import { getBaseDir } from '../../src/env.js'
import mock from './mock/env.js'
import {
  mockElintPlugin,
  mockElintPreset,
  mockElintPresetWithAllTypePlugins,
  mockElintPresetWithOverridePluginConfig
} from './mock/mocks.js'

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
      await expect(loadPresetAndPlugins({ cwd: baseDir })).toReject()
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
      expect(result.pluginResults[0].pluginData.type).toBe('common')
    })
  })

  describe('lintText', () => {
    test('文本检测流程', async () => {
      const result = await lintText('input', {
        preset: mockElintPresetWithAllTypePlugins,
        cwd: baseDir
      })

      expect(
        result.pluginResults.map((result) => result.pluginData.type)
      ).toStrictEqual(['formatter', 'linter', 'linter'])
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
      ).toStrictEqual(['linter'])
    })
  })

  describe('lintFiles', () => {
    test('文件检测流程', async () => {
      const result = await lintFiles(['src/a.js'], {
        cwd: baseDir,
        preset: mockElintPresetWithAllTypePlugins
      })

      expect(result).toHaveLength(1)
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
              async execute(text) {
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
  })

  describe('reset', () => {
    test('reset', async () => {
      const errorMap = await reset({
        cwd: baseDir,
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
