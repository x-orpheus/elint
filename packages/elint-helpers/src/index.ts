import { createRequire } from 'module'
import _debug from 'debug'
import path from 'path'

const debug = _debug('elint-helpers:install')

export interface InstallOptions {
  presetPath?: string
  projectPath?: string
}

export function install({ presetPath, projectPath }: InstallOptions = {}) {
  const currentPresetPath: string = presetPath || process.cwd()

  let currentProjectPath: string = projectPath || ''

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

  const projectName = path.basename(currentProjectPath)

  // 在 preset 开发时跳过安装过程
  if (/^elint-preset-.*/.test(projectName)) {
    console.log(
      `  find elint preset directory: ${projectName}, skip preset installation`
    )
    return
  }

  const require = createRequire(currentPresetPath)

  const packageJson = require('./package.json')

  debug(`preset name: ${packageJson.name}`)

  const config = require(packageJson.name)

  if (config.configs) {
    console.log(config.configs)
  } else {
    console.log(`  ${packageJson.name} does not export any config files.`)
  }
}
