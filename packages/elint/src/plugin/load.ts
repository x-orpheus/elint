import { createRequire } from 'module'
import path from 'path'
import _debug from 'debug'

import { type ElintPlugin, isElintPlugin } from './types.js'
import type { ElintContext } from '../types.js'

const debug = _debug('elint:plugin:load')

const loadElintPlugin = async (
  plugin: string | ElintPlugin<unknown>,
  { cwd, presetPath }: ElintContext
): Promise<ElintPlugin<unknown>> => {
  if (typeof plugin === 'string') {
    const require = createRequire(
      presetPath || path.join(cwd, '__placeholder__.js')
    )

    const pluginPath = require.resolve(plugin)

    const pluginModule = await import(pluginPath)

    const pluginConfig = pluginModule.default || pluginModule

    if (!isElintPlugin(pluginConfig) || pluginConfig.id !== plugin) {
      throw new Error(`${plugin} is not an available elint plugin`)
    }

    return pluginConfig
  }

  if (isElintPlugin(plugin)) {
    return plugin
  }

  throw new Error('unknown elint plugin')
}

export const loadElintPlugins = async (
  plugins: (string | ElintPlugin<unknown>)[],
  ctx: ElintContext
): Promise<ElintPlugin<unknown>[]> => {
  const loadedPlugins = await Promise.all(
    plugins.map((plugin) => loadElintPlugin(plugin, ctx))
  )

  debug(
    'loaded elint plugins: %o',
    loadedPlugins.map((plugin) => plugin.id)
  )

  return loadedPlugins
}
