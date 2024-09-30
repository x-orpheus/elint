import { createElintResult } from '../core/result.js'
import { executeElintPlugin } from './execute.js'
import {
  type ElintPlugin,
  type ElintPluginOptions,
  isElintPlugin,
  type ElintPluginResultWithPluginData
} from './types.js'

/**
 * 插件开发者测试插件的函数
 */
export const testPlugin = async <T>(
  text: string,
  plugin: ElintPlugin<T>,
  pluginOptions: ElintPluginOptions
): Promise<ElintPluginResultWithPluginData<T> | undefined> => {
  if (!isElintPlugin(plugin)) {
    throw new Error('Current plugin is not an elint plugin.')
  }

  const elintResult = createElintResult<T>({ output: text })

  await executeElintPlugin<T>(elintResult, plugin, pluginOptions)

  await plugin.reset?.()

  return elintResult.pluginResults[0]
}
