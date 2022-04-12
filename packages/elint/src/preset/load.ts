import { createRequire } from 'module'
import path from 'path'
import _debug from 'debug'
import type { ElintContext } from '../types.js'
import {
  type ElintPreset,
  type InternalPreset,
  isElintPreset
} from './types.js'
import tryRequire from '../utils/try-require.js'

const debug = _debug('elint:preset:load')

export const loadElintPreset = async (
  preset: string | ElintPreset,
  { cwd }: ElintContext
): Promise<InternalPreset> => {
  debug('start load preset')

  if (typeof preset === 'string') {
    const require = createRequire(path.join(cwd, '__placeholder__.js'))

    const presetPath = require.resolve(preset)

    let presetPackageJson: { name: string; version: string } | undefined

    try {
      presetPackageJson = require(path.join(
        path.dirname(presetPath),
        'package.json'
      ))
    } catch {
      debug(`Preset ${preset} doesn't have a package.json`)
    }

    const presetModule = await import(presetPath)
    const presetConfig = presetModule.default || presetModule

    if (!isElintPreset(presetConfig)) {
      throw new Error(`${preset} is not an available elint preset`)
    }

    debug(
      `loaded preset ${presetPackageJson?.name || 'anonymous'} in ${presetPath}`
    )

    return {
      name: presetPackageJson?.name || 'anonymous',
      version: presetPackageJson?.version || 'unknown',
      path: presetPath,
      preset: presetConfig
    }
  }

  if (isElintPreset(preset)) {
    debug('loaded anonymous preset')

    return {
      name: 'anonymous',
      version: 'unknown',
      path: cwd,
      preset
    }
  }

  throw new Error('unknown elint preset')
}

/**
 * try to find a preset and load it
 */
export const tryLoadElintPreset = ({
  cwd
}: ElintContext): Promise<InternalPreset> => {
  const presetList = tryRequire(/elint-preset-/, cwd)

  debug('find elint preset list: %o', presetList)

  if (!presetList.length) {
    throw new Error(`Not found elint preset in ${cwd}`)
  }

  if (presetList.length !== 1) {
    throw new Error('One project should install one elint preset')
  }

  return loadElintPreset(presetList[0], { cwd })
}
