import { padEnd } from 'lodash-es'
import { version as elintVersion } from '../../package.json'
import { elintPluginCommitLint } from './commitlint/plugin'
// import { version as huskyVersion } from 'husky/package.json'
// import tryRequire from '../utils/try-require'
import { loadElintPlugins } from '../plugin'

export interface VersionOptions {
  plugins?: string[]
}

function printVersionBlock(
  blockName: string,
  versionMap: Record<string, string>
): string[] {
  const output: string[] = []

  if (blockName) {
    output.push('')
    output.push(`  ${blockName}`)
    output.push('')
  }

  const versionNameLength = Math.max(
    ...Object.keys(versionMap).map((v) => v.length)
  )

  Object.entries(versionMap).forEach(([name, version]) => {
    output.push(`    ${padEnd(name, versionNameLength)} : ${version}`)
  })

  return output
}

/**
 * 输出 version
 */
async function version({ plugins = [] }: VersionOptions = {}): Promise<void> {
  const main: Record<string, string> = {
    elint: elintVersion
  }

  const loadedPlugins = await loadElintPlugins(plugins)

  loadedPlugins.unshift(elintPluginCommitLint)

  const pluginVersionMap: Record<string, string> = {}
  const depVersionMap: Record<string, string> = {
    // husky: huskyVersion
  }

  loadedPlugins.forEach((plugin) => {
    const versionConfig = plugin.getVersion()
    if (versionConfig.version !== 'builtIn') {
      pluginVersionMap[plugin.id] = versionConfig.version
    }

    Object.entries(versionConfig.dependencies).forEach(([name, version]) => {
      depVersionMap[name] = version
    })
  })

  // const preset = tryRequire(/elint-preset/)[0]
  // if (preset) {
  //   // eslint-disable-next-line global-require
  //   const { version: presetVersion } = require(`${preset}/package.json`)
  //   main[preset] = presetVersion
  // }

  const output = ['> elint version', '']

  output.push(...printVersionBlock('', main))

  output.push(...printVersionBlock('Plugins:', pluginVersionMap))

  output.push(...printVersionBlock('Dependencies:', depVersionMap))

  output.push('')

  console.log(output.join('\n'))
}

export default version
