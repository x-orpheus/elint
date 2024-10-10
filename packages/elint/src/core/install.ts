import path from 'node:path'
import fs from 'fs-extra'
import _debug from 'debug'
import { getBaseDir } from '../env.js'
import { loadPresetAndPlugins } from './load.js'
import type { ElintInstallOptions } from '../types.js'

const debug = _debug('elint:preset:install')

function installConfigFiles(
  configFiles: string[],
  presetPath: string,
  projectPath: string
) {
  configFiles.forEach((fileName) => {
    try {
      const from = path.join(presetPath, fileName)
      const to = path.join(projectPath, fileName)

      if (!fs.pathExistsSync(from)) {
        return
      }

      fs.copySync(from, to, { overwrite: true })

      debug(`  move: from "${from}"`)
      debug(`          to "${to}"`)
    } catch (e) {
      /* istanbul ignore next */
      debug('install preset config error: %o', e)
    }
  })
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

  const currentPresetPath = internalPreset.path || ''
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

  if (internalPreset.preset.configFiles?.length) {
    debug(
      `installing preset ${internalPreset.name} files [${internalPreset.preset.configFiles.length}]`
    )

    installConfigFiles(
      internalPreset.preset.configFiles,
      currentPresetPath,
      currentProjectPath
    )
  } else {
    for (const internalPlugin of internalPlugins) {
      if (!internalPlugin.plugin.configFiles) {
        continue
      }

      debug(
        `installing plugin ${internalPlugin.name} files [${internalPlugin.plugin.configFiles.length}]`
      )

      installConfigFiles(
        internalPlugin.plugin.configFiles,
        currentPresetPath,
        currentProjectPath
      )
    }
  }

  return errorMap
}
