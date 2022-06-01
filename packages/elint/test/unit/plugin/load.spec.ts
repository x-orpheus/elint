import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import { loadElintPlugins } from '../../../src/plugin/load.js'
import type { ElintPlugin } from '../../../src/index.js'
import { mockElintPlugin } from '../mock/mocks.js'

describe('插件加载测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('无插件加载', async () => {
    const result = await loadElintPlugins([], { cwd: baseDir })

    expect(result).toEqual([])
  })

  test('加载不存在的插件', async () => {
    await expect(
      loadElintPlugins(['elint-plugin-unknown'], {
        cwd: baseDir
      })
    ).toReject()
  })

  test('加载非插件', async () => {
    await expect(
      loadElintPlugins(['elint-preset-node'], {
        cwd: baseDir
      })
    ).toReject()
  })

  test('通过插件名加载插件', async () => {
    const pluginIdList = ['elint-plugin-esm', 'elint-plugin-cjs']

    const plugins = await loadElintPlugins(pluginIdList, {
      cwd: baseDir
    })

    expect(plugins.map((plugin) => plugin.name)).toEqual(pluginIdList)
  })

  test('plugin 对象直接返回', async () => {
    const pluginList: ElintPlugin<unknown>[] = [mockElintPlugin]

    const plugins = await loadElintPlugins(pluginList, {
      cwd: baseDir
    })

    expect(plugins.map((plugin) => plugin.name)).toEqual(['elint-plugin-mock'])
  })
})
