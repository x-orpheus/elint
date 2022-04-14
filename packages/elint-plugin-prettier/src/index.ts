import path from 'path'
import { createRequire } from 'module'
import type { Ignore } from 'ignore'
import prettier, { type Options } from 'prettier'
import type { ElintPlugin, ElintPluginResult } from 'elint'

const require = createRequire(import.meta.url)
const { clearConfigCache, resolveConfig, format } = prettier

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { createIgnorer } = prettier.__internal

let ignorerMap: Record<string, Ignore> = {}

const getIgnorer = (cwd: string) => {
  let ignorer = ignorerMap[cwd]

  if (!ignorer) {
    ignorer = createIgnorer.sync(path.join(cwd, '.prettierignore'))
    ignorerMap[cwd] = ignorer
  }

  return ignorer
}

// 使用 prettier 的方法获取当前文件的格式化配置
const getOptionsForFile = (filePath: string) => {
  const options: Options = {
    endOfLine: 'auto',
    ...resolveConfig.sync(filePath, { editorconfig: false }),
    filepath: filePath
  }
  return options
}

const elintPluginPrettier: ElintPlugin<never> = {
  id: 'elint-plugin-prettier',
  name: 'Prettier',
  type: 'formatter',
  activateConfig: {
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.mjs',
      '.css',
      '.less',
      '.sass',
      '.scss',
      '.md',
      '.mdx',
      '.json',
      '.vue',
      '.yml'
    ]
  },
  async execute(text, { cwd, filePath }) {
    const result: ElintPluginResult<never> = {
      pluginId: this.id,
      source: text,
      output: text,
      success: true
    }

    const ignorer = getIgnorer(cwd)

    if (filePath && ignorer.ignores(filePath)) {
      return result
    }

    const options = getOptionsForFile(filePath || cwd)

    const formatted = format(text, options)

    result.output = formatted ?? result.output
    result.success = formatted === text

    return result
  },
  getVersion() {
    const { version } = require('../package.json')
    const prettierPackageJson = require('prettier/package.json')

    return {
      version,
      dependencies: {
        prettier: prettierPackageJson.version
      }
    }
  },
  reset() {
    ignorerMap = {}
    clearConfigCache()
  }
}

export default elintPluginPrettier
