import _debug from 'debug'
import _ from 'lodash'
import path from 'path'
import type {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginResult,
  ElintPluginType
} from './types'
import { createElintErrorReport, ReportResult } from '../utils/report'

const debug = _debug('elint:plugin')

const loadElintPlugin = async (
  pluginId: string
): Promise<ElintPlugin<unknown>> => {
  const plugin: ElintPlugin<unknown> = (await import(pluginId)).default

  if (!plugin.id || plugin.id !== pluginId) {
    throw new Error(`${pluginId} is not an elint plugin`)
  }
  return plugin
}

export const loadElintPlugins = async (
  names: string[]
): Promise<ElintPlugin<unknown>[]> => {
  const plugins = (
    await Promise.all(names.map((name) => loadElintPlugin(name)))
  ).filter((plugin): plugin is ElintPlugin<unknown> => !!plugin)

  return plugins
}

type ElintPluginGroupByType = {
  [key in ElintPluginType]: ElintPlugin<unknown>[]
}

export const groupElintPluginsByType = (plugins: ElintPlugin<unknown>[]) => {
  return _.groupBy(plugins, (plugin) => plugin.type) as ElintPluginGroupByType
}

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
  report?: ReportResult
}

export const executeElintPlugin = async <T extends ElintPlugin<unknown>>(
  plugin: T,
  options: ElintPluginOptions,
  source = ''
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
      report: pluginResult.message
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
      report: createElintErrorReport(plugin.name, options.filePath, e)
    }
  }
}
