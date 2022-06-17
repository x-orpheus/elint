import { createRequire } from 'module'
import _debug from 'debug'
import path from 'path'
import fs from 'fs-extra'
import { defaultConfigFiles } from './config.js'

const debug = _debug('elint-helpers:install')

export interface InstallOptions {
  presetPath?: string
  projectPath?: string
}

function getAbsolutePath(currentPath?: string) {
  if (!currentPath || typeof currentPath !== 'string') {
    return ''
  }

  if (path.isAbsolute(currentPath)) {
    return currentPath
  }

  return path.join(process.cwd(), currentPath)
}

export function install({ presetPath, projectPath }: InstallOptions = {}) {
  const currentPresetPath: string = getAbsolutePath(presetPath) || process.cwd()

  let currentProjectPath: string = getAbsolutePath(projectPath) || ''

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

  // 在 preset 开发时跳过安装过程
  if (/^elint-preset-.*/.test(projectName)) {
    console.log(
      `  find elint preset directory: ${projectName}, skip preset installation`
    )
    return
  }

  let configFiles: string[] = defaultConfigFiles

  try {
    const require = createRequire(currentPresetPath)

    const packageJson = require(path.join(currentPresetPath, 'package.json'))

    debug(`preset name: ${packageJson.name}`)

    const configModule = require(currentPresetPath)

    const config = configModule?.default ?? configModule

    if (config.configFiles) {
      configFiles = config.configFiles
    }
  } catch (e) {
    debug('read preset config error: %o', e)
  }

  configFiles.forEach((fileName) => {
    const from = path.join(currentPresetPath, fileName)
    const to = path.join(currentProjectPath, fileName)

    if (!fs.pathExistsSync(from)) {
      return
    }

    fs.copySync(from, to, { overwrite: true, recursive: true })

    console.log(`  move: from "${from}"`)
    console.log(`          to "${to}"`)
  })
}
