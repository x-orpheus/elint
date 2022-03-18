import prettier, { type Options } from 'prettier'
import { ElintWorkerFormatter, ElintWorkerResult } from '../worker'

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
  name: 'elint-worker-prettier',
  type: 'formatter',
  availableExtnameList: [
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
  async executeOnText(text, { cwd, filePath }) {
    const result: ElintWorkerResult<never> = {
      worker: {
        name: this.name,
        type: this.type
      },
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
      const error = e instanceof Error ? e : new Error('unknown error')

      result.error = error
      result.success = false
    }

    if (result.error) {
      result.message = `${filePath || 'unknown file'}: ${
        result.error.message
      }\n`
    }

    return result
  },
  reset() {
    clearConfigCache()
  }
}
