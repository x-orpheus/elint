import { createRequire } from 'module'
import path from 'path'
import _debug from 'debug'

import {
  type ElintPlugin,
  isElintPlugin,
  type InternalPlugin
} from './types.js'
import type { ElintContext } from '../types.js'

const debug = _debug('elint:plugin:load')

const loadElintPlugin = async (
  plugin: string | ElintPlugin<unknown>,
  { cwd, presetPath }: ElintContext
): Promise<InternalPlugin> => {
  if (typeof plugin === 'string') {
    debug(`start load plugin: ${plugin}`)

    const require = createRequire(
      path.join(presetPath || cwd, '__placeholder__.js')
    )

    const pluginPath = require.resolve(plugin)

    const pluginModule = await import(pluginPath)

    let pluginPackagePath: string | undefined

    try {
      pluginPackagePath = path.dirname(
        require.resolve(`${plugin}/package.json`)
      )
    } catch {
      debug(`Plugin ${plugin} doesn't have a package.json`)
    }

    const pluginConfig = pluginModule.default || pluginModule

    if (!isElintPlugin(pluginConfig) || pluginConfig.name !== plugin) {
      throw new Error(`'${plugin}' is not an available elint plugin`)
    }

    debug(`loaded plugin: ${plugin}`)

    return {
      name: pluginConfig.name,
      path: pluginPackagePath,
      plugin: pluginConfig
    }
  }

  if (isElintPlugin(plugin)) {
    debug(`loaded custom plugin: ${plugin.name}`)

    return {
      name: plugin.name,
      plugin
    }
  }

  throw new Error('Unknown elint plugin')
}

export const loadElintPlugins = async (
  plugins: (string | ElintPlugin<unknown>)[],
  ctx: ElintContext
): Promise<InternalPlugin[]> => {
  debug('start load elint plugins')

  const internalPlugins = await Promise.all(
    plugins.map((plugin) => loadElintPlugin(plugin, ctx))
  )

  debug(
    'loaded elint plugins: %o',
    internalPlugins.map((internalPlugin) => internalPlugin.name)
  )

  return internalPlugins
}
