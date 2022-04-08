import { createRequire } from 'module'
import path from 'path'
import _debug from 'debug'

import { type ElintPlugin, isElintPlugin } from './types.js'
import type { ElintContext } from '../types.js'

const debug = _debug('elint:plugin:load')

const loadElintPlugin = async (
  pluginId: string,
  { cwd, presetPath }: ElintContext
): Promise<ElintPlugin<unknown>> => {
  const require = createRequire(
    presetPath || path.join(cwd, '__placeholder__.js')
  )

  const pluginPath = require.resolve(pluginId)

  const pluginModule = await import(pluginPath)

  const plugin = pluginModule.default || pluginModule

  if (!isElintPlugin(plugin) || plugin.id !== pluginId) {
    throw new Error(`${pluginId} is not an available elint plugin`)
  }
  return plugin
}

export const loadElintPlugins = async (
  plugins: (string | ElintPlugin<unknown>)[],
  ctx: ElintContext
): Promise<ElintPlugin<unknown>[]> => {
  const loadedPlugins = await Promise.all(
    plugins.map((plugin, index) => {
      if (typeof plugin === 'string') {
        return loadElintPlugin(plugin, ctx)
      }
      if (isElintPlugin(plugin)) {
        return plugin
      }

      /* istanbul ignore next */
      throw new Error(`plugins[${index}] is not an elint plugin`)
    })
  )

  debug(
    'loaded elint plugins: %o',
    loadedPlugins.map((plugin) => plugin.id)
  )

  return loadedPlugins
}
