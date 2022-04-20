import { createElintResult } from '../elint.js'
import { executeElintPlugin } from './execute.js'
import {
  type ElintPlugin,
  type ElintPluginOptions,
  type ElintPluginTestResult,
  isElintPlugin
} from './types.js'

/**
 * 插件开发者测试插件的函数
 */
export const testElintPlugin = async <T>(
  text: string,
  plugin: ElintPlugin<T>,
  pluginOptions: ElintPluginOptions
): Promise<ElintPluginTestResult<T> | null> => {
  if (!isElintPlugin(plugin)) {
    throw new Error('Current plugin is not an elint plugin.')
  }

  const elintResult = createElintResult<T>({ output: text })

  await executeElintPlugin<T>(elintResult, plugin, pluginOptions)

  await plugin.reset?.()

  const version = plugin.getVersion()

  return {
    version,
    result: elintResult.pluginResults?.[0]
  }
}
