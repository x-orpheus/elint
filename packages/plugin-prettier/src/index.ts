import path from 'path'
import chalk from 'chalk'
import type { Ignore } from 'ignore'
import type prettierNamespace from 'prettier'
import type { Options } from 'prettier'
import {
  ElintPluginType,
  type ElintPlugin,
  type ElintPluginResult
} from 'elint'

let prettier: typeof prettierNamespace

let ignorerMap: Record<string, Ignore> = {}

const getIgnorer = (cwd: string) => {
  let ignorer = ignorerMap[cwd]

  if (!ignorer) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { createIgnorer } = prettier.__internal

    ignorer = createIgnorer.sync(path.join(cwd, '.prettierignore'))
    ignorerMap[cwd] = ignorer
  }

  return ignorer
}

// 使用 prettier 的方法获取当前文件的格式化配置
const getOptionsForFile = (filePath: string) => {
  const { resolveConfig } = prettier

  const options: Options = {
    endOfLine: 'auto',
    ...resolveConfig.sync(filePath, { editorconfig: false }),
    filepath: filePath
  }
  return options
}

// prettier cli 的错误处理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePrettierError = (error: any) => {
  const isParseError = Boolean(error && error.loc)

  if (isParseError) {
    return String(error)
  }

  throw error
}

const elintPluginPrettier: ElintPlugin<never> = {
  name: '@elint/plugin-prettier',
  title: 'Prettier',
  type: ElintPluginType.Formatter,
  configFiles: [
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.json',
    'prettierrc.config.js',
    'prettierrc.config.cjs',
    '.prettierignore'
  ],
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
  async load(ctx, importFromPreset) {
    const prettierModule = await importFromPreset('prettier')

    prettier = prettierModule.default || prettierModule
  },
  async execute(text, { cwd, filePath }) {
    const { format } = prettier

    const result: ElintPluginResult<never> = {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }

    const ignorer = getIgnorer(cwd)

    if (filePath && ignorer.ignores(filePath)) {
      return result
    }

    const options = getOptionsForFile(filePath || cwd)

    try {
      const formatted = format(text, options)

      result.output = formatted ?? result.output
    } catch (e) {
      result.message = `${
        filePath ? `${chalk.underline(filePath)}\n  ` : ''
      }${handlePrettierError(e)}`

      result.errorCount = 1
    }

    return result
  },
  reset() {
    const { clearConfigCache } = prettier

    ignorerMap = {}
    clearConfigCache()
  }
}

export default elintPluginPrettier
