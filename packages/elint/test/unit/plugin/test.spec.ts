import type { ElintPlugin } from '../../../src/plugin/types.js'
import { loadElintPlugins } from '../../../src/plugin/load.js'
import { testElintPlugin } from '../../../src/plugin/test.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'

describe('插件执行测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('插件不存在或错误', async () => {
    await expect(
      testElintPlugin('test', {} as ElintPlugin<never>, {
        filePath: 'test.js',
        source: '',
        fix: false,
        cwd: baseDir
      })
    ).toReject()
  })

  test('插件正常执行', async () => {
    const plugins = await loadElintPlugins(['elint-plugin-esm'], {
      cwd: baseDir
    })

    const testPlugin = plugins[0].plugin

    const result = await testElintPlugin('test1', testPlugin, {
      filePath: 'test.js',
      source: '',
      fix: false,
      cwd: baseDir
    })

    expect(result?.output).toBe('test1')
  })
})
