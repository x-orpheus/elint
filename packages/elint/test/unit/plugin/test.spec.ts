import type { ElintPlugin } from '../../../src/plugin/types.js'
import { testPlugin } from '../../../src/plugin/test.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'
import { mockElintPlugin } from '../mock/mocks.js'

describe('插件执行测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  test('插件不存在或错误', async () => {
    await expect(
      testPlugin('test', {} as ElintPlugin<never>, {
        filePath: 'test.js',
        source: '',
        fix: false,
        cwd: baseDir
      })
    ).toReject()
  })

  test('插件正常执行', async () => {
    const result = await testPlugin('test1', mockElintPlugin, {
      filePath: 'test.js',
      source: '',
      fix: false,
      cwd: baseDir
    })

    expect(result?.output).toBe('test1')
  })
})
