import { pathToFileURL } from 'url'
import { createRequire } from 'module'
import path from 'path'
import fs from 'fs-extra'
import _debug from 'debug'
import resolvePackagePath from 'resolve-package-path'
import { cloneDeep } from 'lodash-es'
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
      const presetPackageJsonPath = resolvePackagePath(preset, cwd)

      if (presetPackageJsonPath) {
        presetPackagePath = path.dirname(presetPackageJsonPath)

        presetPackageJson = fs.readJsonSync(presetPackageJsonPath)
      }
    } catch {
      /* istanbul ignore next */
      debug(`Preset ${preset} doesn't have a package.json`)
    }

    const presetModule = await import(pathToFileURL(presetPath).toString())
    const presetConfig = presetModule.default || presetModule

    if (!isElintPreset(presetConfig)) {
      throw new Error(`'${preset}' is not an available elint preset`)
    }

    debug(`loaded preset ${presetPackageJson?.name || preset} in ${presetPath}`)

    return {
      name: presetPackageJson?.name || 'anonymous',
      version: presetPackageJson?.version || 'unknown',
      path: presetPackagePath || path.dirname(presetPath),
      preset: cloneDeep(presetConfig)
    }
  }

  if (isElintPreset(preset)) {
    debug('loaded anonymous preset')

    return {
      name: 'anonymous',
      version: 'unknown',
      preset: cloneDeep(preset)
    }
  }

  throw new Error('Unknown elint preset')
}

/**
 * try to find a preset and load it
 */
export const tryLoadElintPreset = async (
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
