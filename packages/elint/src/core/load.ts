import _debug from 'debug'
import { PRESET_PATTERN } from '../config.js'
import { getBaseDir } from '../env.js'
import { loadElintPlugins } from '../plugin/load.js'
import log from '../utils/log.js'
import type { ElintPluginOverridableKey } from '../plugin/types.js'
import { loadElintPreset, tryLoadElintPreset } from '../preset/load.js'
import type { InternalPreset } from '../preset/types.js'
import type {
  ElintBasicOptions,
  InternalLoadedPresetAndPlugins
} from '../types.js'

const debug = _debug('elint:core:load')

/**
 * 加载 preset 和 plugins
 */
export async function loadPresetAndPlugins({
  preset,
  cwd = getBaseDir()
}: Pick<
  ElintBasicOptions,
  'preset' | 'cwd'
> = {}): Promise<InternalLoadedPresetAndPlugins> {
  let internalPreset: InternalPreset

  if (preset) {
    debug(
      `start load preset: ${typeof preset === 'string' ? preset : 'local preset'}`
    )

    internalPreset = await loadElintPreset(preset, { cwd })
  } else {
    debug('start load preset in node_modules')

    internalPreset = await tryLoadElintPreset(PRESET_PATTERN, { cwd })
  }

  const pendingPlugins = internalPreset.preset.plugins

  const internalPlugins = await loadElintPlugins(pendingPlugins, {
    cwd,
    presetPath: internalPreset.path
  })

  if (!internalPlugins.length) {
    throw new Error(
      `'${internalPreset.name}' doesn't contain available elint plugins`
    )
  }

  if (internalPreset.preset.overridePluginConfig) {
    const overridePluginConfig = internalPreset.preset.overridePluginConfig

    internalPlugins.forEach(({ plugin }) => {
      if (overridePluginConfig[plugin.name]) {
        Object.keys(overridePluginConfig[plugin.name]).forEach((key) => {
          debug(`overriding config of ${plugin.name}: ${key}`)

          const currentKey = key as ElintPluginOverridableKey
          const currentValue = overridePluginConfig[plugin.name][currentKey]

          /* istanbul ignore next */
          if (
            !(['activateConfig'] as ElintPluginOverridableKey[]).includes(
              currentKey
            )
          ) {
            log.warn(`${currentKey} is not in ElintPluginOverridableKey`)
          }
          plugin[currentKey] = currentValue
        })
      }
    })
  }

  internalPlugins.sort((a, b) => {
    return a.plugin.type <= b.plugin.type ? -1 : 1
  })

  debug('loaded preset and plugins')

  return {
    internalPreset,
    internalPlugins
  }
}
