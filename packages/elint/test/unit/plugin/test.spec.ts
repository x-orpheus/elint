import type { ElintPlugin } from '../../../src/plugin/types.js'
import { loadElintPlugins } from '../../../src/plugin/load.js'
import { testElintPlugin } from '../../../src/plugin/test.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'

describe('插件执行测试', () => {
  let unmock: () => void
  let baseDir: string
  let testPlugin: ElintPlugin<unknown>

  beforeAll(async () => {
    unmock = mock()
    baseDir = getBaseDir()
    const plugins = await loadElintPlugins(['elint-plugin-esm'], {
      cwd: baseDir
    })
    testPlugin = plugins[0].plugin
  })

  afterAll(() => {
    unmock()
  })

  test('插件不存在或错误', async () => {
    expect(async () => {
      await testElintPlugin('test', {} as ElintPlugin<never>, {
        filePath: 'test.js',
        source: '',
        fix: false,
        style: false,
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('插件正常执行', async () => {
    const result = await testElintPlugin('test1', testPlugin, {
      filePath: 'test.js',
      source: '',
      fix: false,
      style: false,
      cwd: baseDir
    })

    expect(result?.output).toBe('test1')
  })
})
