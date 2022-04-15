import path from 'path'
import type { ElintResult } from '../types.js'
import {
  type ElintPlugin,
  type ElintPluginOptions,
  type ElintPluginTestResult,
  isElintPlugin
} from './types.js'

const checkElintPluginActivation = (
  plugin: ElintPlugin<unknown>,
  options: ElintPluginOptions
): boolean => {
  if (plugin.activateConfig.activate) {
    return plugin.activateConfig.activate(options)
  }

  if (options.filePath && plugin.activateConfig.extensions?.length) {
    if (
      plugin.activateConfig.extensions.includes(path.extname(options.filePath))
    ) {
      return true
    }
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
  if (!checkElintPluginActivation(plugin, pluginOptions)) {
    return
  }

  const pluginResult = await plugin.execute(elintResult.output, pluginOptions)

  elintResult.output = pluginResult.output
  elintResult.errorCount += pluginResult.errorCount
  elintResult.warningCount += pluginResult.warningCount
  elintResult.pluginResults.push({
    ...pluginResult,
    pluginId: plugin.id,
    pluginName: plugin.name
  })
}

export const testElintPlugin = async <T>(
  source: string,
  plugin: ElintPlugin<T>,
  pluginOptions: ElintPluginOptions
): Promise<ElintPluginTestResult<T> | null> => {
  if (!isElintPlugin(plugin)) {
    throw new Error('Current plugin is not an elint plugin.')
  }

  if (!checkElintPluginActivation(plugin, pluginOptions)) {
    return null
  }

  await plugin.reset?.()

  const version = plugin.getVersion()

  const result = await plugin.execute(source, pluginOptions)

  return {
    version,
    result
  }
}
