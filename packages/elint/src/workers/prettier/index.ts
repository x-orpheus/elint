import prettier, { type Options } from 'prettier'
import chalk from 'chalk'
import { ElintWorkerFormatter, ElintWorkerResult } from '../types'

const { clearConfigCache, resolveConfig, format } = prettier

// 使用 prettier 的方法获取当前文件的格式化配置
const getOptionsForFile = (filePath: string) => {
  const options: Options = {
    endOfLine: 'auto',
    ...resolveConfig.sync(filePath, { editorconfig: false }),
    filepath: filePath
  }
  return options
}

export const elintWorkerPrettier: ElintWorkerFormatter<never> = {
  id: 'elint-worker-prettier',
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
    ],
    type: 'file'
  },
  async execute(text, { cwd, filePath }) {
    const result: ElintWorkerResult<never> = {
      workerId: this.id,
      input: text,
      output: text,
      success: true
    }

    try {
      const options = getOptionsForFile(filePath || cwd)

      const formatted = format(text, options)

      result.output = formatted ?? result.output
      result.success = formatted === text
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')

      result.error = error
      result.success = false

      result.message = `${
        chalk.underline(filePath) || 'Untitled file'
      }\n  ${chalk.red('Error')}: ${error.message}\n\n`
    }

    return result
  },
  reset() {
    clearConfigCache()
  }
}
