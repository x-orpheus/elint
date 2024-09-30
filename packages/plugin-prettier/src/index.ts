import path from 'node:path'
import chalk from 'chalk'
import type prettierNamespace from 'prettier'
import type { Options } from 'prettier'
import {
  ElintPluginType,
  type ElintPlugin,
  type ElintPluginResult
} from 'elint'
import { createIsIgnoredFunction } from './ignore.js'

let prettier: typeof prettierNamespace

interface Prettier2Internal {
  createIgnorer: {
    sync(ignorePath: string): { ignores: (filePath: string) => boolean }
  }
}

type IsIgnored = (filePath: string) => boolean

const isIgnoredMap = new Map<string, IsIgnored>()

const getIsIgnored = async (cwd: string) => {
  let isIgnored = isIgnoredMap.get(cwd)

  if (!isIgnored) {
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const prettierInternal: Prettier2Internal = (prettier as any).__internal

    if (prettierInternal && prettierInternal.createIgnorer) {
      // v2

      const ignorer = prettierInternal.createIgnorer.sync(
        path.join(cwd, '.prettierignore')
      )

      isIgnored = ignorer.ignores.bind(ignorer)
    } else {
      // v3

      isIgnored = (await createIsIgnoredFunction(
        ['.gitignore', '.prettierignore'].map((item) => path.join(cwd, item)),
        false
      )) as IsIgnored
    }

    if (isIgnored) {
      isIgnoredMap.set(cwd, isIgnored)
    }
  }

  return isIgnored
}

// 使用 prettier 的方法获取当前文件的格式化配置
const getOptionsForFile = async (filePath: string) => {
  const { resolveConfig } = prettier

  const config = await resolveConfig(filePath, { editorconfig: false })

  const options: Options = {
    endOfLine: 'auto',
    ...config,
    filepath: filePath
  }
  return options
}

// prettier cli 的错误处理
const handlePrettierError = (error: unknown) => {
  const isParseError = Boolean(error && (error as { loc: number }).loc)

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
    const prettierModule = await importFromPreset<{
      default: typeof prettierNamespace
    }>('prettier')

    prettier = prettierModule.default
  },
  async execute(text, { cwd, filePath }) {
    const { format } = prettier

    const result: ElintPluginResult<never> = {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }

    const isIgnored = await getIsIgnored(cwd)

    if (filePath && isIgnored && isIgnored(filePath)) {
      return result
    }

    const options = await getOptionsForFile(filePath || cwd)

    try {
      const formatted = await format(text, options)

      result.output = formatted ?? result.output
    } catch (e) {
      result.message = `${
        filePath ? `${chalk.underline(filePath)}\n  ` : ''
      }${handlePrettierError(e)}`

      result.errorCount = 1
    }

    return result
  },
  async reset() {
    const { clearConfigCache } = prettier

    isIgnoredMap.clear()

    await clearConfigCache()
  }
}

export default elintPluginPrettier
