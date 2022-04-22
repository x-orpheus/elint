import { createRequire } from 'module'
import { padEnd, fill } from 'lodash-es'
import { loadPresetAndPlugins } from '../elint.js'
import path from 'path'

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
  const { version: huskyVersion } = require('husky/package.json')

  const main: Record<string, ElintPluginVersion> = {
    elint: elintVersion,
    'husky(builtIn)': huskyVersion
  }

  const presetVersionMap: Record<string, string> = {}
  const pluginVersionMap: Record<string, ElintPluginVersion> = {}

  presetVersionMap[internalPreset.name] = internalPreset.version

  internalPlugins.forEach((internalPlugin) => {
    if (internalPlugin.path) {
      const pluginPackageJsonPath = path.join(
        internalPlugin.path,
        '__placeholder__.js'
      )
      const pluginRequire = createRequire(pluginPackageJsonPath)
      const pluginPackageJson = pluginRequire(pluginPackageJsonPath)
      const versionConfig: ElintPluginVersion = {
        version: pluginPackageJson,
        dependencies: {}
      }

      if (pluginPackageJson.dependencies) {
        Object.keys(pluginPackageJson.dependencies).forEach(
          (dependencyName: string) => {
            const dependencyPackageJson = pluginRequire(
              `${dependencyName}/package.json`
            )
            versionConfig.dependencies[dependencyName] =
              dependencyPackageJson.version || 'unknown'
          }
        )
      }

      pluginVersionMap[internalPlugin.name] = versionConfig
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
