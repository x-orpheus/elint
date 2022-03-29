import _debug from 'debug'
import path from 'path'
import { ElintPlugin, ElintPluginOptions, ElintPluginResult } from './types.js'
import { createErrorReportResult, ReportResult } from '../utils/report.js'

const debug = _debug('elint:plugin:execute')

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

interface ExecuteElintPluginResult {
  success: boolean
  pluginResult?: ElintPluginResult<unknown>
  reportResult?: ReportResult
}

export const executeElintPlugin = async <T extends ElintPlugin<unknown>>(
  plugin: T,
  source: string,
  options: ElintPluginOptions
): Promise<ExecuteElintPluginResult> => {
  try {
    if (!checkElintPluginActivation(plugin, options)) {
      return {
        success: true
      }
    }

    const pluginResult = await plugin.execute(source, options)

    return {
      success: pluginResult.success,
      pluginResult,
      reportResult: pluginResult.message
        ? {
            name: plugin.name,
            success: pluginResult.success,
            output: pluginResult.message
          }
        : undefined
    }
  } catch (e) {
    debug(`[${plugin.id}] error: ${e}`)

    return {
      success: false,
      reportResult: createErrorReportResult(plugin.name, options.filePath, e)
    }
  }
}
