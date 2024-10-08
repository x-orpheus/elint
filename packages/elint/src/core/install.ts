import path from 'node:path'
import fs from 'fs-extra'
import _debug from 'debug'
import { getBaseDir } from '../env.js'
import { loadPresetAndPlugins } from './load.js'
import type { ElintInstallOptions } from '../types.js'

const debug = _debug('elint:preset:install')

function getAbsolutePath(currentPath?: string): string {
  if (!currentPath || typeof currentPath !== 'string') {
    return ''
  }

  if (path.isAbsolute(currentPath)) {
    return currentPath
  }

  return path.join(getBaseDir(), currentPath)
}

/**
 * 安装 preset 内部携带的配置文件
 */
export async function install({
  preset,
  cwd = getBaseDir(),
  internalLoadedPresetAndPlugins,
  projectPath
}: ElintInstallOptions = {}) {
  const { internalPreset, internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const currentPresetPath = getAbsolutePath(internalPreset.path)
  const currentProjectPath = projectPath || getBaseDir()

  debug(`preset: ${currentPresetPath}`)
  debug(`project: ${currentProjectPath}`)

  if (
    !currentPresetPath ||
    !currentProjectPath ||
    !fs.existsSync(currentPresetPath) ||
    !fs.existsSync(currentProjectPath)
  ) {
    throw new Error('no available preset or project.')
  }
  const errorMap: Record<string, unknown> = {}

  for (const internalPlugin of internalPlugins) {
    try {
      if (!internalPlugin.plugin.configFiles) {
        continue
      }

      debug(
        `installing plugin ${internalPlugin.name} files [${internalPlugin.plugin.configFiles.length}]`
      )

      internalPlugin.plugin.configFiles.forEach((fileName) => {
        const from = path.join(currentPresetPath, fileName)
        const to = path.join(currentProjectPath, fileName)

        if (!fs.pathExistsSync(from)) {
          return
        }

        fs.copySync(from, to, { overwrite: true })

        debug(`  move: from "${from}"`)
        debug(`          to "${to}"`)
      })
    } catch (e) {
      debug('install preset config error: %o', e)
    }
  }

  return errorMap
}
