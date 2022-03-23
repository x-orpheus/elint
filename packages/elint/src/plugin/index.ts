import _debug from 'debug'
import _ from 'lodash'
import path from 'path'
import { elintPluginEsLint } from './eslint'
import { elintPluginPrettier } from './prettier'
import { elintPluginStylelint } from './stylelint'
import { elintPluginCommitLint } from './commitlint'
import type {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginResult,
  ElintPluginType
} from './types'
import { createElintErrorReport, ReportResult } from '../utils/report'

const debug = _debug('elint:plugin')

/**
 * 内置 plugin
 */
export const builtInPlugins: Record<string, ElintPlugin<unknown>> = {
  'elint-plugin-eslint': elintPluginEsLint,
  'elint-plugin-stylelint': elintPluginStylelint,
  'elint-plugin-prettier': elintPluginPrettier,
  'elint-plugin-commitlint': elintPluginCommitLint
}

const loadElintPlugin = (name: string): ElintPlugin<unknown> | null => {
  if (builtInPlugins[name]) {
    return builtInPlugins[name]
  }

  // 暂时不支持外部
  return null
}

export const loadElintPlugins = (names: string[]) => {
  const plugins = names
    .map((name) => loadElintPlugin(name))
    .filter((plugin): plugin is ElintPlugin<unknown> => !!plugin)

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
