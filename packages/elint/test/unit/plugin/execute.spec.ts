import type {
  ElintPlugin,
  ElintPluginActivateConfig
} from '../../../src/plugin/types.js'
import { loadElintPlugins } from '../../../src/plugin/load.js'
import { executeElintPlugin } from '../../../src/plugin/execute.js'
import { createElintResult } from '../../../src/elint.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'

const activateConfigFunction: ElintPluginActivateConfig = {
  activate: ({ source }) => {
    const value = JSON.parse(source)

    return value.active || false
  }
}

describe('插件执行测试', () => {
  let unmock: () => void
  let baseDir: string
  let testPlugin: ElintPlugin<unknown>

  beforeEach(async () => {
    unmock = mock()
    baseDir = getBaseDir()
    const plugins = await loadElintPlugins(['elint-plugin-esm'], {
      cwd: baseDir
    })
    testPlugin = plugins[0].plugin
  })

  afterEach(() => {
    unmock()
  })

  test('命中扩展名', async () => {
    const elintResult = createElintResult({ output: 'test1' })

    await executeElintPlugin(elintResult, testPlugin, {
      filePath: 'test.js',
      source: '',
      fix: false,
      style: false,
      cwd: baseDir
    })

    expect(elintResult.output).toBe('test1')
  })

  test('未命中扩展名', async () => {
    const elintResult = createElintResult({ output: 'test1' })

    await executeElintPlugin(elintResult, testPlugin, {
      filePath: 'test.css',
      source: '',
      fix: false,
      style: false,
      cwd: baseDir
    })

    expect(elintResult.pluginResults).toBeEmpty()
  })

  test('无 filePath 参数', async () => {
    const elintResult = createElintResult({ output: 'test1' })

    await executeElintPlugin(elintResult, testPlugin, {
      source: '',
      fix: false,
      style: false,
      cwd: baseDir
    })

    expect(elintResult.output).toBe('test1')
  })

  test('使用 activate 函数', async () => {
    const elintResult1 = createElintResult({ output: 'test1' })
    const elintResult2 = createElintResult({ output: 'test1' })

    testPlugin.activateConfig = activateConfigFunction

    await executeElintPlugin(elintResult1, testPlugin, {
      source: JSON.stringify({ active: true }),
      fix: false,
      style: false,
      cwd: baseDir
    })

    await executeElintPlugin(elintResult2, testPlugin, {
      source: JSON.stringify({ active: false }),
      fix: false,
      style: false,
      cwd: baseDir
    })

    expect(elintResult1.output).toBe('test1')
    expect(elintResult2.pluginResults).toBeEmpty()
  })
})
