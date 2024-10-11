import path from 'node:path'
import type { ElintResult } from '../types.js'
import { type ElintPlugin, type ElintPluginOptions } from './types.js'

const checkElintPluginActivation = (
  plugin: ElintPlugin<unknown>,
  options: ElintPluginOptions
): boolean => {
  if (plugin.activateConfig.activate) {
    return plugin.activateConfig.activate(options)
  }

  // 当 lint 的内容没有文件路径时，将会直接执行
  if (!options.filePath) {
    return true
  }

  if (
    plugin.activateConfig.extensions?.includes(path.extname(options.filePath))
  ) {
    return true
  }

  return false
}

/**
 * 执行 elint 插件
 *
 * 会直接修改 elintResult 的值
 */
export const executeElintPlugin = async <T = unknown>(
  elintResult: ElintResult,
  plugin: ElintPlugin<T>,
  pluginOptions: ElintPluginOptions
): Promise<void> => {
  if (!checkElintPluginActivation(plugin, pluginOptions) || !plugin.execute) {
    return
  }

  const pluginResult = await plugin.execute(elintResult.output, pluginOptions)

  elintResult.output = pluginResult.output
  elintResult.errorCount += pluginResult.errorCount
  elintResult.warningCount += pluginResult.warningCount
  elintResult.pluginResults.push({
    ...pluginResult,
    pluginData: {
      name: plugin.name,
      title: plugin.title,
      type: plugin.type
    }
  })
}
