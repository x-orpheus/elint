import { createRequire } from 'module'
import { padEnd, fill } from 'lodash-es'
import { loadPresetAndPlugins } from '../elint.js'
import type { ElintPluginVersion } from '../plugin/types.js'

const require = createRequire(import.meta.url)

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
  const { internalPreset, loadedPlugins } = await loadPresetAndPlugins({ cwd })

  const { version: elintVersion } = require('../../package.json')
  const { version: huskyVersion } = require('husky/package.json')

  const main: Record<string, ElintPluginVersion> = {
    elint: elintVersion,
    'husky(builtIn)': huskyVersion
  }

  const presetVersionMap: Record<string, string> = {}
  const pluginVersionMap: Record<string, ElintPluginVersion> = {}

  if (internalPreset) {
    presetVersionMap[internalPreset.name] = internalPreset.version
  }

  loadedPlugins.forEach((plugin) => {
    const versionConfig = plugin.getVersion()
    pluginVersionMap[plugin.id] = versionConfig
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
