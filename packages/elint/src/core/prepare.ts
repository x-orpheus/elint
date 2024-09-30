import _debug from 'debug'
import { getBaseDir } from '../env.js'
import type { ElintOptions } from '../types.js'
import { loadPresetAndPlugins } from './load.js'

const debug = _debug('elint:core:prepare')

export async function prepare({
  preset,
  cwd = getBaseDir(),
  internalLoadedPresetAndPlugins
}: ElintOptions = {}): Promise<Record<string, unknown>> {
  const { internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const errorMap: Record<string, unknown> = {}

  for (const internalPlugin of internalPlugins) {
    try {
      debug(`elint plugin ${internalPlugin.name} prepare`)

      await internalPlugin.plugin.prepare?.({
        cwd,
        presetPath: internalPlugin.path
      })
    } catch (e) {
      errorMap[internalPlugin.name] = e
      debug(`elint plugin ${internalPlugin.name} prepare error %o`, e)
    }
  }

  return errorMap
}
