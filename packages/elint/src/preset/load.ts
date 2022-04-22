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

    let presetPackagePath: string | undefined
    let presetPackageJson: { name: string; version: string } | undefined

    try {
      presetPackagePath = path.dirname(
        require.resolve(`${preset}/package.json`)
      )
      presetPackageJson = require(`${preset}/package.json`)
    } catch {
      debug(`Preset ${preset} doesn't have a package.json`)
    }

    const presetModule = await import(presetPath)
    const presetConfig = presetModule.default || presetModule

    if (!isElintPreset(presetConfig)) {
      throw new Error(`'${preset}' is not an available elint preset`)
    }

    debug(`loaded preset ${presetPackageJson?.name || preset} in ${presetPath}`)

    return {
      name: presetPackageJson?.name || preset,
      version: presetPackageJson?.version || 'unknown',
      path: presetPackagePath,
      preset: presetConfig
    }
  }

  if (isElintPreset(preset)) {
    debug('loaded anonymous preset')

    return {
      name: 'anonymous',
      version: 'unknown',
      preset
    }
  }

  throw new Error('Unknown elint preset')
}

/**
 * try to find a preset and load it
 */
export const tryLoadElintPreset = (
  pattern: RegExp,
  { cwd }: ElintContext
): Promise<InternalPreset> => {
  const presetList = tryRequire(pattern, cwd)

  debug('find elint preset list: %o', presetList)

  if (!presetList.length) {
    throw new Error(`Not found elint preset in ${cwd}`)
  }

  if (presetList.length !== 1) {
    throw new Error('One project should install only one elint preset')
  }

  return loadElintPreset(presetList[0], { cwd })
}
