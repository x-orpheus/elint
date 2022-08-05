import path from 'path'
import _debug from 'debug'
import resolvePackagePath from 'resolve-package-path'
import { cloneDeep } from 'lodash-es'
import {
  type ElintPlugin,
  isElintPlugin,
  type InternalPlugin
} from './types.js'
import importFromPath from '../utils/import-from-path.js'
import type { ElintContext } from '../types.js'

const debug = _debug('elint:plugin:load')

const loadElintPlugin = async (
  plugin: string | ElintPlugin<unknown>,
  { cwd, presetPath }: ElintContext
): Promise<InternalPlugin> => {
  const importFromPreset = (id: string) => importFromPath(id, presetPath || cwd)

  if (typeof plugin === 'string') {
    debug(`start load plugin: ${plugin}`)

    const pluginModule = await importFromPath(plugin, presetPath || cwd)

    let pluginPackagePath: string | undefined

    try {
      const pluginPackageJsonPath = resolvePackagePath(
        plugin,
        presetPath || cwd
      )

      if (pluginPackageJsonPath) {
        pluginPackagePath = path.dirname(pluginPackageJsonPath)
      }
    } catch {
      /* istanbul ignore next */
      debug(`Plugin ${plugin} doesn't have a package.json`)
    }

    /* istanbul ignore next */
    const pluginConfig = pluginModule.default || pluginModule

    if (!isElintPlugin(pluginConfig) || pluginConfig.name !== plugin) {
      throw new Error(`'${plugin}' is not an available elint plugin`)
    }

    debug(`loaded plugin: ${plugin}`)

    const elintPlugin = cloneDeep(pluginConfig)

    await elintPlugin.load?.({ cwd, presetPath }, importFromPreset)

    return {
      name: pluginConfig.name,
      path: pluginPackagePath,
      plugin: elintPlugin
    }
  }

  if (isElintPlugin(plugin)) {
    debug(`loaded custom plugin: ${plugin.name}`)

    const elintPlugin = cloneDeep(plugin)

    await elintPlugin.load?.({ cwd, presetPath }, importFromPreset)

    return {
      name: plugin.name,
      plugin: elintPlugin
    }
  }

  /* istanbul ignore next */
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
