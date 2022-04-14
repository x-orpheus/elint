import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import { loadElintPlugins } from '../../../src/plugin/load.js'
import type { ElintPlugin } from '../../../src/index.js'

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
    await expect(async () => {
      await loadElintPlugins(['elint-plugin-unknown'], {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('加载非插件', async () => {
    await expect(async () => {
      await loadElintPlugins(['elint-preset-node'], {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('通过插件名加载插件', async () => {
    const pluginIdList = ['elint-plugin-esm', 'elint-plugin-cjs']

    const plugins = await loadElintPlugins(pluginIdList, {
      cwd: baseDir
    })

    expect(plugins.map((plugin) => plugin.id)).toEqual(pluginIdList)
  })

  test('plugin 对象直接返回', async () => {
    const pluginList: ElintPlugin<unknown>[] = [
      {
        id: 'elint-plugin-local',
        name: 'local',
        type: 'linter',
        activateConfig: {
          extensions: []
        },
        async execute() {
          return {
            pluginId: this.id,
            success: true,
            source: '',
            output: ''
          }
        },
        getVersion() {
          return {
            version: 'unknown'
          }
        }
      }
    ]

    const plugins = await loadElintPlugins(pluginList, {
      cwd: baseDir
    })

    expect(plugins.map((plugin) => plugin.id)).toEqual(['elint-plugin-local'])
  })
})
