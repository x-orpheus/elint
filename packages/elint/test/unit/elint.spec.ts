import {
  lintCommon,
  loadPresetAndPlugins,
  reset,
  lintText
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
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: mockElintPresetWithAllTypePlugins,
        cwd: baseDir
      })

      const result = await lintCommon({
        internalLoadedPresetAndPlugins,
        cwd: baseDir
      })

      expect(result.pluginResults).toHaveLength(1)
      expect(result.pluginResults[0].pluginData.type).toBe('common')
    })
  })

  describe('lintText', () => {
    test('文本检测流程', async () => {
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: mockElintPresetWithAllTypePlugins,
        cwd: baseDir
      })

      const result = await lintText('input', {
        internalLoadedPresetAndPlugins,
        cwd: baseDir
      })

      expect(
        result.pluginResults.map((result) => result.pluginData.type)
      ).toStrictEqual(['formatter', 'linter', 'linter'])
    })

    test('没有 formatter 时不检查格式', async () => {
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: {
          ...mockElintPresetWithAllTypePlugins,
          plugins: mockElintPresetWithAllTypePlugins.plugins.slice(1)
        },
        cwd: baseDir
      })

      const result = await lintText('input', {
        internalLoadedPresetAndPlugins,
        cwd: baseDir
      })

      expect(
        result.pluginResults.map((result) => result.pluginData.type)
      ).toStrictEqual(['linter'])
    })
  })

  describe('reset', () => {
    test('reset', async () => {
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: mockElintPreset,
        cwd: baseDir
      })

      const errorMap = await reset({
        cwd: baseDir,
        internalLoadedPresetAndPlugins
      })

      expect(errorMap).toBeEmpty()
    })

    test('reset with error', async () => {
      const internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
        preset: {
          plugins: [
            {
              ...mockElintPlugin,
              reset: () => {
                throw new Error()
              }
            }
          ]
        },
        cwd: baseDir
      })

      const errorMap = await reset({
        cwd: baseDir,
        internalLoadedPresetAndPlugins
      })

      expect(errorMap[mockElintPlugin.name]).not.toBeUndefined()
    })
  })
})
