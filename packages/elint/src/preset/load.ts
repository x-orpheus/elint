import { createRequire } from 'module'
import path from 'path'
import _debug from 'debug'
import { ElintContext } from '../elint.js'
import { ElintPreset, InternalElintPreset, isElintPreset } from './types.js'
import tryRequire from '../utils/try-require.js'

const debug = _debug('elint:preset:load')

export const loadElintPreset = async (
  preset: string | ElintPreset,
  { cwd }: ElintContext
): Promise<InternalElintPreset> => {
  if (typeof preset === 'string') {
    const require = createRequire(path.join(cwd, '__placeholder__.js'))

    const presetPath = require.resolve(preset)
    const presetPackageJson = require(path.join(
      path.dirname(presetPath),
      'package.json'
    ))
    const presetModule = await import(presetPath)
    const presetConfig = presetModule.default || presetModule

    if (!isElintPreset(presetConfig)) {
      throw new Error(`${preset} is not an available elint preset`)
    }

    debug(`loaded preset ${presetPackageJson.name} in ${presetPath}`)

    return {
      name: presetPackageJson.name,
      version: presetPackageJson.version || 'unknown',
      path: presetPath,
      preset: presetConfig
    }
  }

  if (isElintPreset(preset)) {
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
}: ElintContext): Promise<InternalElintPreset> => {
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
