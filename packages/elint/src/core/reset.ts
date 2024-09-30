import _debug from 'debug'
import { resetElintCache } from '../cache/index.js'
import { getBaseDir } from '../env.js'
import type { ElintOptions } from '../types.js'
import { loadPresetAndPlugins } from './load.js'

const debug = _debug('elint:core:reset')

export async function reset({
  preset,
  cwd = getBaseDir(),
  cacheLocation,
  internalLoadedPresetAndPlugins
}: ElintOptions = {}): Promise<Record<string, unknown>> {
  const { internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const errorMap: Record<string, unknown> = {}

  resetElintCache({ cwd, cacheLocation })

  for (const internalPlugin of internalPlugins) {
    try {
      debug(`elint plugin ${internalPlugin.name} reset`)

      await internalPlugin.plugin.reset?.()
    } catch (e) {
      errorMap[internalPlugin.name] = e
      debug(`elint plugin ${internalPlugin.name} reset error %o`, e)
    }
  }

  return errorMap
}
