import _debug from 'debug'
import { groupBy } from 'lodash-es'
import path from 'path'
import type {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginResult,
  ElintPluginType
} from './types'
import { createErrorReportResult, ReportResult } from '../utils/report'

const debug = _debug('elint:plugin')

export function isElintPlugin(value: unknown): value is ElintPlugin<unknown> {
  if (
    value &&
    typeof value === 'object' &&
    (value as ElintPlugin<unknown>).id &&
    (['formatter', 'linter'] as ElintPluginType[]).indexOf(
      (value as ElintPlugin<unknown>).type
    ) !== -1
  ) {
    return true
  }
  return false
}

const loadElintPlugin = async (
  pluginId: string
): Promise<ElintPlugin<unknown>> => {
  const plugin = (await import(pluginId)).default

  if (!isElintPlugin(plugin) || plugin.id !== pluginId) {
    throw new Error(`${pluginId} is not an elint plugin`)
  }
  return plugin
}

export const loadElintPlugins = async (
  plugins: (string | ElintPlugin<unknown>)[]
): Promise<ElintPlugin<unknown>[]> => {
  const loadedPlugins = await Promise.all(
    plugins.map((plugin, index) => {
      if (typeof plugin === 'string') {
        return loadElintPlugin(plugin)
      }
      if (isElintPlugin(plugin)) {
        return plugin
      }

      throw new Error(`plugins[${index}] is not an elint plugin`)
    })
  )

  debug(
    'loaded elint plugins: %o',
    loadedPlugins.map((plugin) => plugin.id)
  )

  return loadedPlugins
}

type ElintPluginGroupByType = {
  [key in ElintPluginType]: ElintPlugin<unknown>[]
}

export const groupElintPluginsByType = (plugins: ElintPlugin<unknown>[]) => {
  return groupBy(plugins, (plugin) => plugin.type) as ElintPluginGroupByType
}

export const checkElintPluginActivation = (
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
