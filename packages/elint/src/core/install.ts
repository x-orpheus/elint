import path from 'node:path'
import fs from 'fs-extra'
import _debug from 'debug'
import log from '../utils/log.js'
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

export async function install({
  presetPath,
  projectPath
}: ElintInstallOptions = {}) {
  const currentPresetPath = getAbsolutePath(presetPath) || process.cwd()

  let currentProjectPath = getAbsolutePath(projectPath) || ''

  if (!currentProjectPath) {
    currentProjectPath = currentPresetPath.split(
      `${path.sep}node_modules${path.sep}`
    )[0]

    if (process.versions.pnp) {
      currentProjectPath = currentPresetPath.split(
        `${path.sep}.yarn${path.sep}`
      )[0]
    }
  }

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

  const projectName = path.basename(currentProjectPath)

  const errorMap: Record<string, unknown> = {}

  // 在 preset 开发时跳过安装过程，如果强行指定了 projectPath 则跳过名称检测
  if (!projectPath && /^elint-preset-.*/.test(projectName)) {
    log.warn(
      `  find elint preset directory: ${projectName}, skip preset installation`
    )
    return errorMap
  }

  const { internalPlugins } = await loadPresetAndPlugins({
    preset: presetPath
  })

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
