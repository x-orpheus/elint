import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'
import { loadPresetAndPlugins } from '../../../src/core/load.js'
import { mockElintPresetWithOverridePluginConfig } from '../mock/mocks.js'

describe('preset load', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

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
