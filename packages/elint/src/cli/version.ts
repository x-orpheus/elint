import { createRequire } from 'module'
import { padEnd, fill } from 'lodash-es'
import fs from 'fs-extra'
import resolvePackagePath from 'resolve-package-path'
import { loadPresetAndPlugins } from '../elint.js'

const { findUpPackagePath } = resolvePackagePath

interface ElintPluginVersion {
  /**
   * 插件版本号
   */
  version: string
  /**
   * 需要展示 version 的依赖
   */
  dependencies: {
    [name: string]: string
  }
}

function printVersionBlock({
  blockName,
  versionMap,
  indent = 2,
  parentLength = 0
}: {
  blockName?: string
  versionMap: Record<string, string | ElintPluginVersion>
  indent?: number
  parentLength?: number
}): string[] {
  const output: string[] = []

  if (blockName) {
    output.push('')
    output.push(`${fill(Array(indent), ' ').join('')}${blockName}`)
    output.push('')
  }

  const versionNameLength = Math.max(
    ...Object.keys(versionMap).map((v) => v.length),
    parentLength
  )

  Object.entries(versionMap).forEach(([name, versionValue]) => {
    const isPluginVersion = typeof versionValue !== 'string'
    const version = isPluginVersion ? versionValue.version : versionValue

    output.push(
      `${fill(Array(indent + 2), ' ').join('')}${padEnd(
        name,
        versionNameLength
      )} : ${version}`
    )

    if (isPluginVersion && versionValue.dependencies) {
      output.push(
        ...printVersionBlock({
          versionMap: versionValue.dependencies,
          indent: indent + 2,
          parentLength: versionNameLength - 2
        })
      )
    }
  })

  return output
}

/**
 * 输出 version
 */
async function version(cwd?: string): Promise<void> {
  const { internalPreset, internalPlugins } = await loadPresetAndPlugins({
    cwd
  })

  const require = createRequire(import.meta.url)

  const { version: elintVersion } = require('../../package.json')

  const main: Record<string, ElintPluginVersion> = {
    elint: elintVersion
  }

  const presetVersionMap: Record<string, string> = {}
  const pluginVersionMap: Record<string, ElintPluginVersion> = {}

  presetVersionMap[internalPreset.name] = internalPreset.version

  internalPlugins.forEach((internalPlugin) => {
    const pluginPath = internalPlugin.path
    if (pluginPath) {
      const pluginPackageJsonPath = findUpPackagePath(pluginPath)

      if (pluginPackageJsonPath) {
        const pluginPackageJson = fs.readJsonSync(pluginPackageJsonPath)

        const versionConfig: ElintPluginVersion = {
          version: pluginPackageJson.version,
          dependencies: {}
        }

        if (pluginPackageJson.peerDependencies) {
          Object.keys(pluginPackageJson.peerDependencies).forEach(
            (dependencyName: string) => {
              const dependencyPackageJsonPath = resolvePackagePath(
                dependencyName,
                pluginPath
              )
              if (dependencyPackageJsonPath) {
                const dependencyPackageJson = fs.readJsonSync(
                  dependencyPackageJsonPath
                )
                versionConfig.dependencies[dependencyName] =
                  dependencyPackageJson.version
              }
            }
          )
        }

        pluginVersionMap[internalPlugin.name] = versionConfig
      }
    }
  })

  const output = ['> elint version', '']

  output.push(...printVersionBlock({ versionMap: main }))

  output.push(
    ...printVersionBlock({ blockName: 'Preset:', versionMap: presetVersionMap })
  )

  output.push(
    ...printVersionBlock({
      blockName: 'Plugins:',
      versionMap: pluginVersionMap
    })
  )

  output.push('')

  console.log(output.join('\n'))
}

export default version
