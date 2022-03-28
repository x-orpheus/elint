import _debug from 'debug'
import { groupBy } from 'lodash-es'

import { ElintPlugin, ElintPluginType, isElintPlugin } from './types'

const debug = _debug('elint:plugin:load')

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
